
import React from 'react';

const Banner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">
            India's #1 Online Shopping Destination
          </h2>
          <p className="text-xl opacity-90 mb-6">
            Discover millions of products at the best prices
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>7 Day Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span>Secure Payments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
