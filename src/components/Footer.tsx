
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">ABOUT</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-300">Contact Us</a></li>
              <li><a href="#" className="hover:text-gray-300">About Us</a></li>
              <li><a href="#" className="hover:text-gray-300">Careers</a></li>
              <li><a href="#" className="hover:text-gray-300">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">HELP</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-300">Payments</a></li>
              <li><a href="#" className="hover:text-gray-300">Shipping</a></li>
              <li><a href="#" className="hover:text-gray-300">Cancellation & Returns</a></li>
              <li><a href="#" className="hover:text-gray-300">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">POLICY</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-300">Return Policy</a></li>
              <li><a href="#" className="hover:text-gray-300">Terms Of Use</a></li>
              <li><a href="#" className="hover:text-gray-300">Security</a></li>
              <li><a href="#" className="hover:text-gray-300">Privacy</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">SOCIAL</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-300">Facebook</a></li>
              <li><a href="#" className="hover:text-gray-300">Twitter</a></li>
              <li><a href="#" className="hover:text-gray-300">YouTube</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 Flipkart Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
