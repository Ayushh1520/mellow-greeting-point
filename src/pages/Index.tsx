
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Header from '@/components/Header';
import CategoryBar from '@/components/CategoryBar';
import Banner from '@/components/Banner';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CategoryBar />
      <Banner />
      <div className="container mx-auto px-4 py-8">
        <ProductGrid />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
