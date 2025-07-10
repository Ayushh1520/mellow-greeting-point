
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, Filter } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      searchProducts(query);
    }
  }, [searchParams]);

  const searchProducts = async (query: string) => {
    setLoading(true);
    console.log('Searching for:', query);
    
    const searchTerm = query.toLowerCase().trim();
    console.log('Processed search term:', searchTerm);
    
    // Get all active products first
    const { data: allProducts, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setLoading(false);
      return;
    }

    console.log('Total products found:', allProducts?.length);

    // Advanced filtering and scoring system
    const scoredProducts = allProducts?.map(product => {
      let score = 0;
      const name = (product.name || '').toLowerCase();
      const brand = (product.brand || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      
      // Exact name match gets highest score
      if (name === searchTerm) score += 100;
      
      // Name starts with search term
      if (name.startsWith(searchTerm)) score += 80;
      
      // Name contains search term
      if (name.includes(searchTerm)) score += 60;
      
      // Brand exact match
      if (brand === searchTerm) score += 70;
      
      // Brand starts with search term
      if (brand.startsWith(searchTerm)) score += 50;
      
      // Brand contains search term
      if (brand.includes(searchTerm)) score += 30;
      
      // Description contains search term (lower priority)
      if (description.includes(searchTerm)) score += 10;
      
      // Partial word matches in name (for compound searches)
      const searchWords = searchTerm.split(' ');
      searchWords.forEach(word => {
        if (word.length > 2) {
          if (name.includes(word)) score += 20;
          if (brand.includes(word)) score += 15;
        }
      });
      
      return { ...product, searchScore: score };
    }).filter(product => product.searchScore > 0) || [];

    // Sort by score (highest first) then by rating
    const sortedProducts = scoredProducts.sort((a, b) => {
      if (b.searchScore !== a.searchScore) {
        return b.searchScore - a.searchScore;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    console.log('Filtered products:', sortedProducts.length);
    console.log('Top results:', sortedProducts.slice(0, 3).map(p => ({ name: p.name, score: p.searchScore })));
    
    setProducts(sortedProducts);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-12"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 px-3"
              >
                <SearchIcon size={16} />
              </Button>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </form>
        </div>

        {searchParams.get('q') && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Search results for "{searchParams.get('q')}"
            </h1>
            <p className="text-gray-600 mt-1">
              {products.length} {products.length === 1 ? 'result' : 'results'} found
            </p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : searchParams.get('q') ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600 mb-4">
              No products found
            </h2>
            <p className="text-gray-500 mb-6">
              Try searching with different keywords or check your spelling
            </p>
            <Button onClick={() => navigate('/')}>
              Browse All Products
            </Button>
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  );
};

export default Search;
