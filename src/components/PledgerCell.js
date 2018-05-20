import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon, List } from 'antd';

class PledgerCell extends React.Component {
  static renderIncumbent(item) {
    if (item.incumbent) {
      return `Incumbent ${item.role}.`;
    }
    return null;
  }

  render() {
    const {
      item,
    } = this.props;
    const pledgerCellClass = classNames({
      incumbent: item.incumbent,
      'pledger-cell': true,
    });

    const pledgerStatusClass = classNames({
      pledged: item.pledged,
      'pledge-status': true,
    });

    if (!item.displayName) {
      return null;
    }

    const title = `${item.displayName} (${item.party})`;

    const description = item.pledged ? (<Icon type="check-circle" />) : (<Icon type="question-circle-o" />);
    return (
      <React.Fragment>
        <List.Item.Meta
          bodystyle={{ padding: '5px' }}
          className={pledgerCellClass}
          title={<div>{PledgerCell.renderIncumbent(item)} {title}</div>}
          description={item.status ? <div>{item.status}</div> : null}
        />
        <div className={pledgerStatusClass}>Pledged: {description}</div>
      </React.Fragment>
    );
  }
}

PledgerCell.propTypes = {
  item: PropTypes.shape({}).isRequired,
};

export default PledgerCell;
