import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService, Product, Article } from '../services/apiService';

interface CreatedProduct {
  name: string;
  createdAt: Date;
  createdBy: string;
}

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [createdProducts, setCreatedProducts] = useState<CreatedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [canMake, setCanMake] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    loadCreatedProducts();
  }, []);

  // Reset availability check when product selection changes
  useEffect(() => {
    setCanMake(null);
  }, [selectedProduct]);

  const loadData = async () => {
    try {
      const [productsRes, articlesRes] = await Promise.all([
        apiService.getProducts(),
        apiService.getArticles(),
      ]);
      setProducts(productsRes.data);
      setArticles(articlesRes.data);
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const loadCreatedProducts = () => {
    const saved = localStorage.getItem('createdProducts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      const products = parsed.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
      setCreatedProducts(products);
    }
  };

  const saveCreatedProduct = (productName: string) => {
    const newProduct: CreatedProduct = {
      name: productName,
      createdAt: new Date(),
      createdBy: user?.username || 'Unknown'
    };
    
    const updated = [...createdProducts, newProduct];
    setCreatedProducts(updated);
    localStorage.setItem('createdProducts', JSON.stringify(updated));
  };

  const deleteCreatedProduct = async (productToDelete: CreatedProduct) => {
    if (!isAdmin) return;
    
    if (!window.confirm(`Are you sure you want to delete this "${productToDelete.name}" product? This will restore the used articles back to inventory.`)) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Call backend API to restore inventory
      await apiService.deleteProduct(productToDelete.name);

      // Remove from created products list using the exact product object
      const updated = createdProducts.filter(p => 
        p.name !== productToDelete.name || 
        p.createdAt.getTime() !== productToDelete.createdAt.getTime() ||
        p.createdBy !== productToDelete.createdBy
      );
      setCreatedProducts(updated);
      localStorage.setItem('createdProducts', JSON.stringify(updated));
      
      // Reset the availability check state since inventory has changed
      setCanMake(null);
      
      // Reload data from server to get updated inventory
      await loadData();
      
      alert('Product deleted and articles restored to inventory!');
    } catch (err) {
      setError('Failed to delete product');
      console.error('Delete product error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkCanMake = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await apiService.canProductBeMade(selectedProduct);
      setCanMake(response.data);
    } catch (err) {
      setError('Failed to check product availability');
      setCanMake(null);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async () => {
    if (!selectedProduct || !isAdmin) return;
    
    setLoading(true);
    setError('');
    try {
      await apiService.createProduct(selectedProduct);
      saveCreatedProduct(selectedProduct);
      alert('Product created successfully!');
      await loadData(); // Reload data to see updated stock
      setCanMake(null); // Reset availability check
    } catch (err) {
      setError('Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '15px', maxWidth: '1800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Warehouse Management Dashboard</h1>
        <div>
          <span>Welcome, {user?.username} ({user?.role})</span>
          <button 
            onClick={logout}
            style={{ marginLeft: '15px', padding: '5px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {/* Products Section */}
        <div>
          <h2>Products</h2>
          <div style={{ marginBottom: '20px' }}>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            >
              <option value="">Select a product...</option>
              {products.map((product, index) => (
                <option key={index} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button 
                onClick={checkCanMake} 
                disabled={!selectedProduct || loading}
                style={{ 
                  padding: '8px 15px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: selectedProduct && !loading ? 'pointer' : 'not-allowed'
                }}
              >
                Check Availability
              </button>
              
              {isAdmin && (
                <button 
                  onClick={createProduct} 
                  disabled={!selectedProduct || loading || canMake === false}
                  style={{ 
                    padding: '8px 15px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: selectedProduct && !loading && canMake !== false ? 'pointer' : 'not-allowed'
                  }}
                >
                  Create Product
                </button>
              )}
            </div>

            {canMake !== null && (
              <div style={{ 
                padding: '10px', 
                backgroundColor: canMake ? '#d4edda' : '#f8d7da', 
                color: canMake ? '#155724' : '#721c24',
                borderRadius: '4px'
              }}>
                {canMake ? '✅ Product can be made' : '❌ Product cannot be made (insufficient stock)'}
              </div>
            )}
          </div>

          <div style={{ border: '1px solid #ddd', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Product Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Articles Needed</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{product.name}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                      {product.contain_articles.map((article, idx) => (
                        <div key={idx} style={{ fontSize: '0.9em' }}>
                          {article.art_id}: {article.amount_of}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Articles Section */}
        <div>
          <h2>Articles Inventory</h2>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Article ID</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article, index) => (
                  <tr key={index}>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{article.art_id}</td>
                    <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{article.name}</td>
                    <td style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #eee', 
                      textAlign: 'right',
                      color: article.stock < 10 ? '#dc3545' : '#28a745'
                    }}>
                      {article.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Created Products Section */}
        <div>
          <h2>Created Products</h2>
          <div style={{ marginBottom: '10px', fontSize: '0.9em', color: '#666' }}>
            Total created: {createdProducts.length} products
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', maxHeight: '400px', overflowY: 'auto' }}>
            {createdProducts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                No products created yet
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Product</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Created By</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date & Time</th>
                    {isAdmin && (
                      <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {createdProducts
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Most recent first
                    .map((product, index) => (
                    <tr key={index}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{product.name}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{product.createdBy}</td>
                      <td style={{ 
                        padding: '10px', 
                        borderBottom: '1px solid #eee',
                        fontSize: '0.9em'
                      }}>
                        {product.createdAt.toLocaleString()}
                      </td>
                      {isAdmin && (
                        <td style={{ 
                          padding: '10px', 
                          borderBottom: '1px solid #eee',
                          textAlign: 'center'
                        }}>
                          <button
                            onClick={() => deleteCreatedProduct(product)}
                            disabled={loading}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              fontSize: '0.8em',
                              cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
