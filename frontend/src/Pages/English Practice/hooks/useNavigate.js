// This is a mock implementation for the useNavigate hook
// In a real application, this would be imported from react-router-dom

export const useNavigate = () => {
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    // In a real app, this would use the router to navigate
  };
  
  return navigate;
};