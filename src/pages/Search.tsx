
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
    
    // More precise search - prioritize exact matches and relevant terms
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
    console.log('Search terms:', searchTerms);
    
    // Build a more targeted search query
    let searchQuery = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    // Create conditions for each search term to match in name, description, or brand
    const conditions = searchTerms.map(term => 
      `name.ilike.%${term}%,description.ilike.%${term}%,brand.ilike.%${term}%`
    ).join(',');
    
    const { data, error } = await searchQuery
      .or(conditions)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } else {
      console.log('Search results:', data?.length);
      // Filter results for better relevance
      const filteredResults = data?.filter(product => {
        const productText = `${product.name} ${product.description} ${product.brand}`.toLowerCase();
        // Check if the product contains at least one of the search terms significantly
        return searchTerms.some(term => 
          productText.includes(term) && 
          (product.name?.toLowerCase().includes(term) || 
           product.brand?.toLowerCase().includes(term) ||
           product.description?.toLowerCase().includes(term))
        );
      }) || [];
      
      // Sort by relevance - name matches first, then brand, then description
      const sortedResults = filteredResults.sort((a, b) => {
        const aNameMatch = searchTerms.some(term => a.name?.toLowerCase().includes(term));
        const bNameMatch = searchTerms.some(term => b.name?.toLowerCase().includes(term));
        const aBrandMatch = searchTerms.some(term => a.brand?.toLowerCase().includes(term));
        const bBrandMatch = searchTerms.some(term => b.brand?.toLowerCase().includes(term));
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        if (aBrandMatch && !bBrandMatch) return -1;
        if (!aBrandMatch && bBrandMatch) return 1;
        
        return 0;
      });
      
      setProducts(sortedResults);
    }
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
              Try searching with different keywords
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
