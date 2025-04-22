import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Home = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to /upload route when the component mounts
    router.replace('/upload');
  }, [router]);
  
  // You can show a loading state while redirecting
  return (
    <div className="flex items-center justify-center h-screen">
      <p>Redirecting to upload page...</p>
    </div>
  );
};

export default Home;