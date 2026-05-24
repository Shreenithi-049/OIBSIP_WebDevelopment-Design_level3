import { motion } from 'framer-motion';

const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const colors = { primary: 'border-primary', secondary: 'border-secondary', white: 'border-white' };
  return (
    <div className={`${sizes[size]} border-4 ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="text-6xl mb-4 inline-block"
      >
        🍕
      </motion.div>
      <p className="text-app-text font-semibold text-lg">Loading PizzaHub...</p>
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="card p-4 animate-pulse">
    <div className="bg-gray-200 rounded-xl h-48 mb-4" />
    <div className="bg-gray-200 rounded h-4 mb-2 w-3/4" />
    <div className="bg-gray-200 rounded h-4 w-1/2" />
  </div>
);

export default Spinner;
