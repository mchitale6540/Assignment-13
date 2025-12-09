import React, { Component } from 'react';
import Filters from './Filters';
import ProductTable from './ProductTable';
import ProductForm from './ProductForm';

class Products extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterText: '',
      products: {}   // { [id]: productDocument }
    };
    this.handleFilter = this.handleFilter.bind(this);
    this.handleDestroy = this.handleDestroy.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.loadProducts = this.loadProducts.bind(this);
  }

  componentDidMount() {
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const response = await fetch('/product/get');
      const data = await response.json();

      const products = {};
      data.forEach((doc) => {
        products[doc.id] = doc; // doc has { id, product: { ... } }
      });

      this.setState({ products });
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  handleFilter(filterInput) {
    this.setState(filterInput);
  }

  async handleSave(productWrapper) {
    try {
      const response = await fetch('/product/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productWrapper) // { product: { ... } }
      });

      const saved = await response.json();

      this.setState((prevState) => {
        const products = { ...prevState.products };
        products[saved.id] = saved;
        return { products };
      });
    } catch (err) {
      console.error('Error saving product:', err);
    }
  }

  async handleDestroy(productId) {
    try {
      await fetch(`/product/delete/${productId}`, {
        method: 'DELETE'
      });

      this.setState((prevState) => {
        const products = { ...prevState.products };
        delete products[productId];
        return { products };
      });
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  }

  render() {
    return (
      <div>
        <h1>My Inventory</h1>
        <Filters onFilter={this.handleFilter} />
        <ProductTable
          products={this.state.products}
          filterText={this.state.filterText}
          onDestroy={this.handleDestroy}
        />
        <ProductForm onSave={this.handleSave} />
      </div>
    );
  }
}

export default Products;
