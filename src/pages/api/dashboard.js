export default function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    // This is mock data. In a real application, you would fetch from a database
    const mockItems = [
      {
        id: 1,
        title: 'Item 1',
        description: 'This is the first item',
        createdAt: new Date().toISOString(),
        tags: ['tag1', 'tag2'],
        status: 'active'
      },
      {
        id: 2,
        title: 'Item 2',
        description: 'This is the second item',
        createdAt: new Date().toISOString(),
        tags: ['tag2', 'tag3'],
        status: 'pending'
      },
      {
        id: 3,
        title: 'Item 3',
        description: 'This is the third item',
        createdAt: new Date().toISOString(),
        tags: ['tag1', 'tag3'],
        status: 'archived'
      },
      {
        id: 4,
        title: 'Item 4',
        description: 'This is the fourth item',
        createdAt: new Date().toISOString(),
        tags: ['tag4'],
        status: 'active'
      },
      {
        id: 5,
        title: 'Item 5',
        description: 'This is the fifth item',
        createdAt: new Date().toISOString(),
        tags: ['tag2', 'tag4'],
        status: 'pending'
      }
    ];
  
    // Simulate network delay
    setTimeout(() => {
      res.status(200).json(mockItems);
    }, 500);
  }