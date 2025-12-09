

import React, { Component } from 'react';
import ProductRow from './ProductRow';

class ProductTable extends Component {
  constructor(props) {
    super(props);
    this.handleDestroy = this.handleDestroy.bind(this);
  }

  handleDestroy(id) {
    this.props.onDestroy(id);
  }

  render() {
    const productsArray = Object.keys(this.props.products).map(
      (pid) => this.props.products[pid]
    );

    const rows = [];

    productsArray.forEach((productDoc) => {
      const name = (productDoc.product && productDoc.product.name) || '';

      if (name.indexOf(this.props.filterText) === -1) {
        return;
      }

      rows.push(
        <ProductRow
          product={productDoc}
          key={productDoc.id}
          onDestroy={this.handleDestroy}
        />
      );
    });

    return (
      <div>
        <table className="table table-striped table-sm">
          <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>In Stock</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  }
}

export default ProductTable;
