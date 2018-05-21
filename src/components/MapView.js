import React from 'react';
import PropTypes from 'prop-types';
import { filter } from 'lodash';
import geoViewport from '@mapbox/geo-viewport';
import { stateAbrvToName, fips } from '../data/dictionaries';
import { 
  takenThePledge, 
  totalPledgedInDistricts, 
  totalPledgedInCategory, 
  zeroPadding 
} from '../utils';

import bboxes from '../data/bboxes';
import states from '../data/states';
import MapInset from '../components/MapInset';

class MapView extends React.Component {
  constructor(props) {
    super(props);
    this.filterDistrict = ['any'];
    this.includedStates = ['in', 'NAME'];

    this.addPopups = this.addPopups.bind(this);
    this.addClickListener = this.addClickListener.bind(this);
    this.setStateStyle = this.setStateStyle.bind(this);
    this.setDistrictStyle = this.setDistrictStyle.bind(this);
    this.showStateTooltip = this.showStateTooltip.bind(this);
    this.showDistrictTooltip = this.showDistrictTooltip.bind(this);
    this.setStateStyleMask = this.setStateStyleMask.bind(this);
    this.focusMap = this.focusMap.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.toggleFilters = this.toggleFilters.bind(this);
    this.highlightDistrict = this.highlightDistrict.bind(this);
    this.districtSelect = this.districtSelect.bind(this);
    this.removeHighlights = this.removeHighlights.bind(this);
    this.insetOnClickEvent = this.insetOnClickEvent.bind(this);
    this.state = {
      alaskaItems: props.items.AK,
      filterStyle: 'state',
      hawaiiItems: props.items.HI,
      popoverColor: 'popover-has-data',
    };
  }

  componentDidMount() {
    this.initializeMap();
  }

  componentWillReceiveProps(nextProps) {
    const {
      selectedState,
      districts,
    } = nextProps;
    this.map.metadata = { selectedState: nextProps.selectedState };
    if (selectedState) {
      this.setStateStyleMask(selectedState);
      const bbname = selectedState.toUpperCase();
      this.map.metadata.level = 'districts';
      if (this.state.filterStyle === 'state') {
        this.setState({ filterStyle: 'district' });
      }
      if (districts.length > 0) {
        const stateFIPS = states.find(cur => cur.USPS === bbname).FIPS;
        // highlight district
        const districtPadded = zeroPadding(districts[0]);
        const geoID = `${stateFIPS}${districtPadded}`;
        const selectObj = {
          district: districtPadded,
          geoID,
          state: nextProps.selectedState,
        };
        this.districtSelect(selectObj);
      }
      const stateBB = bboxes[bbname];
      return this.focusMap(stateBB);
    }
    this.setStateStyleMask();
    this.map.metadata.level = 'state';
    this.setState({ filterStyle: 'state' });
    return this.map.fitBounds([[-128.8, 23.6], [-65.4, 50.2]]);
  }

  componentDidUpdate(prevProps, prevState) {
    // changing between coloring by state and coloring by district
    const mapStyle = {
      district: this.setDistrictStyle,
      state: this.setStateStyle,
    };
    if (prevState.filterStyle !== this.state.filterStyle || prevProps.selectedState !== this.props.selectedState) {
      mapStyle[this.state.filterStyle]();
      // clearing any previous popups
      this.popup.remove();
    }
  }

  setDistrictStyle() {
    const { items } = this.props;
    const lowNumbers = ['any'];
    const medNumbers = ['any'];
    const highNumbers = ['any'];

    Object.keys(items).forEach((state) => {
      if (!items[state]) {
        return;
      }
      Object.keys(items[state]).forEach((district) => {
        let count = 0;
        const districtId = zeroPadding(district);
        const fipsId = fips[state];
        const geoid = fipsId + districtId;
        count += filter((items[state][district]), 'pledged').length;
        if (count >= 3) {
          highNumbers.push(['==', 'GEOID', geoid]);
        } else if (count >= 2) {
          medNumbers.push(['==', 'GEOID', geoid]);
        } else if (count > 0 && count < 2) {
          lowNumbers.push(['==', 'GEOID', geoid]);
        }
      });
    });
    this.toggleFilters('district_high_number', highNumbers);
    this.toggleFilters('district_med_number', medNumbers);
    this.toggleFilters('district_low_number', lowNumbers);
  }

  setStateStyleMask(state) {
    if (state) {
      const filterSetting = ['!=', 'ref', state];
      this.toggleFilters('state-mask', filterSetting);
    } else {
      this.map.setLayoutProperty('state-mask', 'visibility', 'none');
    }
  }

  setStateStyle() {
    const { items } = this.props;
    const lowNumbers = ['in', 'ABR'];
    const medNumbers = ['in', 'ABR'];
    const highNumbers = ['in', 'ABR'];
    Object.keys(items).forEach((state) => {
      let count = 0;
      Object.keys(items[state]).forEach((district) => {
        count += filter((items[state][district]), 'pledged').length;
      });
      if (count >= 10) {
        highNumbers.push(state);
      } else if (count >= 4) {
        medNumbers.push(state);
      } else if (count > 0 && count < 4) {
        lowNumbers.push(state);
      }
    });
    this.toggleFilters('district_high_number', highNumbers);
    this.toggleFilters('district_med_number', medNumbers);
    this.toggleFilters('district_low_number', lowNumbers);
  }

  addClickListener() {
    const {
      searchByDistrict,
    } = this.props;
    const { map } = this;

    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(
        e.point,
        {
          layers: ['district_interactive'],
        },
      );
      const feature = {};
      if (features.length > 0) {
        feature.state = features[0].properties.ABR;
        feature.district = features[0].properties.GEOID.substring(2, 4);
        feature.geoID = features[0].properties.GEOID;
        let districts = [Number(feature.district)];

        if (map.metadata.selectedState !== feature.state) {
          districts = [];
        }
        searchByDistrict({
          districts,
          state: feature.state,
        });
      }
    });
  }

  // Handles the highlight for districts when clicked on.
  highlightDistrict(geoid) {
    let filterSettings;
    // Filter for which district has been selected.
    if (typeof geoid === 'object') {
      filterSettings = ['any'];

      geoid.forEach((i) => {
        filterSettings.push(['==', 'GEOID', i]);
      });
    } else {
      filterSettings = ['all', ['==', 'GEOID', geoid]];
    }
    // Set that layer filter to the selected
    this.toggleFilters('selected-fill', filterSettings);
    this.toggleFilters('selected-border', filterSettings);
  }

  toggleFilters(layer, filterSettings) {
    this.map.setFilter(layer, filterSettings);
    this.map.setLayoutProperty(layer, 'visibility', 'visible');
  }

  districtSelect(feature) {
    if (feature.state) {
      this.highlightDistrict(feature.geoID);
    } else {
      const visibility = this.map.getLayoutProperty('selected-fill', 'visibility');
      if (visibility === 'visible') {
        this.map.setLayoutProperty('selected-fill', 'visibility', 'none');
        this.map.setLayoutProperty('selected-border', 'visibility', 'none');
      }
    }
  }

  showStateTooltip(state) {
    const { items } = this.props;
    const name = stateAbrvToName[state];
    const itemsInState = items[state];
    let tooltip = `<h4>${name}</h4>`;

    if (itemsInState) {
      this.setState({ popoverColor: 'popover-has-data' });
      tooltip += '<div>Pledge takers:</div>';
      if (itemsInState.Sen) {
        const totalstatewide = totalPledgedInCategory(itemsInState, 'Sen');
        tooltip += `<div>U.S. Senate candidates: <strong>${totalstatewide}</strong></div>`;
      }
      if (itemsInState.Gov) {
        const totalstatewide = totalPledgedInCategory(itemsInState, 'Gov');
        tooltip += `<div>Candidates for governor: <strong>${totalstatewide}</strong></div>`;
      }
      const totalDistricts = totalPledgedInDistricts(itemsInState);

      tooltip += `<div>U.S. House candidates: <strong>${totalDistricts}</strong></div>`;
      tooltip += '<div><em>Click for details</em></div>';
    } else {
      this.setState({ popoverColor: 'popover-no-data' });
      tooltip += '<div><em>No one has taken the pledge</em></div>';
    }
    return tooltip;
  }

  showDistrictTooltip(state, district) {
    const { items } = this.props;
    let tooltip = `<h4>${state} ${district}</h4>`;
    if (!items[state]) {
      return null;
    }
    const people = items[state][district] ? items[state][district] : [];
    if (people.length) {
      const incumbent = people.filter(person => person.incumbent === true)[0] || false;
      if (incumbent) {
        tooltip += `<div>Incumbent <strong>${incumbent.displayName}</strong>${takenThePledge(incumbent)}</div>`;
      }
      const totalR = filter(people, { pledged: true, incumbent: false, party: 'R' }).length;
      const totalD = filter(people, { pledged: true, incumbent: false, party: 'D' }).length;
      const totalI = filter(people, { pledged: true, incumbent: false, party: 'I' }).length;
      tooltip += `<div>Republican candidates: <strong>${totalR}</strong></div>`;
      tooltip += `<div>Democratic candidates: <strong>${totalD}</strong></div>`;
      tooltip += `<div>Independent candidates: <strong>${totalI}</strong></div>`;
    } else {
      tooltip += '<div>No one in this district has signed the pledge yet.</div>';
    }
    return tooltip;
  }

  addPopups(layer) {
    const { map } = this;
    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: true,
    });
    const { items } = this.props;

    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [layer] });
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

      if (features.length) {
        const feature = features[0];
        // ABR:"ME",
        // GEOID:"2302"
        // NAME:"Maine"
        // STATEFP:"23"
        const { properties } = feature;
        const stateAbr = properties.ABR;
        let tooltip;
        if (map.metadata.level === 'districts') {
          if (!items[stateAbr]) {
            return undefined;
          }
          tooltip = this.showDistrictTooltip(stateAbr, Number(properties.GEOID.substring(2)));
        } else {
          tooltip = this.showStateTooltip(stateAbr);
        }
        if (tooltip) {
          return this.popup.setLngLat(e.lngLat)
            .setHTML(tooltip)
            .addTo(map);
        }
      }
      return undefined;
    });
  }

  focusMap(bb) {
    if (!bb) {
      return;
    }
    const height = window.innerHeight;
    const width = window.innerWidth;
    const view = geoViewport.viewport(bb, [width / 2, height / 2]);
    if (view.zoom < 2.5) {
      view.zoom = 2.5;
    } else {
      view.zoom -= 0.5;
    }
    this.map.flyTo(view);
  }

  insetOnClickEvent(e) {
    const dataBounds = e.target.parentNode.parentNode.getAttribute('data-bounds').split(',');
    const boundsOne = [Number(dataBounds[0]), Number(dataBounds[1])];
    const boundsTwo = [Number(dataBounds[2]), Number(dataBounds[3])];
    const bounds = boundsOne.concat(boundsTwo);
    this.map.fitBounds(bounds);
  }

  removeHighlights() {
    this.map.setLayoutProperty('selected-fill', 'visibility', 'none');
    this.map.setLayoutProperty('selected-border', 'visibility', 'none');
  }

  handleReset() {
    this.removeHighlights();
    this.props.resetSelections();
  }
  // Creates the button in our zoom controls to go to the national view
  makeZoomToNationalButton() {
    document.querySelector('.mapboxgl-ctrl-compass').remove();
    if (document.querySelector('.mapboxgl-ctrl-usa')) {
      document.querySelector('.mapboxgl-ctrl-usa').remove();
    }
    const usaButton = document.createElement('button');
    usaButton.className = 'mapboxgl-ctrl-icon mapboxgl-ctrl-usa';
    usaButton.innerHTML = '<span class="usa-icon"></span>';

    usaButton.addEventListener('click', this.handleReset);
    document.querySelector('.mapboxgl-ctrl-group').appendChild(usaButton);
  }

  initializeMap() {
    const { selectedState } = this.props;

    mapboxgl.accessToken =
      'pk.eyJ1IjoidG93bmhhbGxwcm9qZWN0IiwiYSI6ImNqMnRwOG4wOTAwMnMycG1yMGZudHFxbWsifQ.FXyPo3-AD46IuWjjsGPJ3Q';
    const styleUrl = 'mapbox://styles/townhallproject/cjgr7qoqr00012ro4hnwlvsyp';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: styleUrl,
    });

    // Set Mapbox map controls
    this.map.addControl(new mapboxgl.NavigationControl());
    this.map.scrollZoom.disable();
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.makeZoomToNationalButton();
    this.map.metadata = {
      level: 'states',
      selectedState,
    };
    // map on 'load'
    this.map.on('load', () => {
      this.map.fitBounds([[-128.8, 23.6], [-65.4, 50.2]]);
      this.addClickListener();
      this.addPopups('district_interactive');
      this.setStateStyle();
    });
  }

  render() {
    const {
      districts,
      selectedState,
      resetSelections,
      searchByDistrict,
      setUsState,
    } = this.props;

    return (
      <React.Fragment>
        <div id="map" className={this.state.popoverColor}>
          <div className="map-overlay" id="legend">
            <MapInset
              items={this.state.alaskaItems}
              stateName="AK"
              districts={districts}
              selectedState={selectedState}
              resetSelections={resetSelections}
              searchByDistrict={searchByDistrict}
              setUsState={setUsState}
              mapId="map-overlay-alaska"
              bounds={[[-170.15625, 51.72702815704774], [-127.61718749999999, 71.85622888185527]]}
            />
            <MapInset
              items={this.state.hawaiiItems}
              stateName="HI"
              districts={districts}
              selectedState={selectedState}
              resetSelections={resetSelections}
              searchByDistrict={searchByDistrict}
              setUsState={setUsState}
              mapId="map-overlay-hawaii"
              bounds={[
                [-161.03759765625, 18.542116654448996],
                [-154.22607421875, 22.573438264572406]]}
            />
          </div>
        </div>

      </React.Fragment>
    );
  }
}

MapView.propTypes = {
  districts: PropTypes.arrayOf(PropTypes.number),
  items: PropTypes.shape({}).isRequired,
  resetSelections: PropTypes.func.isRequired,
  searchByDistrict: PropTypes.func.isRequired,
  selectedState: PropTypes.string,
  setUsState: PropTypes.func.isRequired,
};

MapView.defaultProps = {
  districts: [],
  selectedState: '',
};

export default MapView;
