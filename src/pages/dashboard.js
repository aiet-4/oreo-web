import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/List.module.css';

export default function List() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch list items on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/items');
        
        if (!response.ok) {
          throw new Error('Failed to fetch items');
        }
        
        const data = await response.json();
        setItems(data);
        
        // Select the first item by default if available
        if (data.length > 0) {
          setSelectedItem(data[0]);
        }
      } catch (err) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Handle item selection
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Item List</title>
        <meta name="description" content="List view application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Item List</h1>

        <div className={styles.splitView}>
          {/* Left panel (30% width) */}
          <div className={styles.leftPanel}>
            <h2>Items</h2>
            
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : items.length === 0 ? (
              <div className={styles.empty}>No items found</div>
            ) : (
              <ul className={styles.itemList}>
                {items.map((item) => (
                  <li 
                    key={item.id} 
                    className={`${styles.itemListItem} ${selectedItem && selectedItem.id === item.id ? styles.selected : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    {item.title || item.name || `Item ${item.id}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Right panel (70% width) */}
          <div className={styles.rightPanel}>
            <h2>Item Details</h2>
            
            {selectedItem ? (
              <div className={styles.itemDetails}>
                <h3>{selectedItem.title || selectedItem.name || `Item ${selectedItem.id}`}</h3>
                
                {/* Display all properties of the selected item */}
                <div className={styles.properties}>
                  {Object.entries(selectedItem).map(([key, value]) => (
                    <div key={key} className={styles.property}>
                      <strong>{key}:</strong> 
                      {typeof value === 'object' 
                        ? JSON.stringify(value) 
                        : String(value)
                      }
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.noSelection}>
                Select an item from the list to view details
              </div>
            )}
          </div>
        </div>

        <div className={styles.navigation}>
          <Link href="/" className={styles.link}>
            Back to Upload
          </Link>
        </div>
      </main>
    </div>
  );
}