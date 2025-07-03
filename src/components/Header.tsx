
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, Package, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import CartSidebar from './CartSidebar';

const Header = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-white hover:bg-blue-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
              <h1 
                className="text-2xl font-bold cursor-pointer"
                onClick={() => navigate('/')}
              >
                Flipkart
              </h1>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 border-0 text-gray-900"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 px-3"
                >
                  <Search size={16} />
                </Button>
              </div>
            </form>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-blue-700 hidden md:flex"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <User size={20} className="mr-2" />
                    Account
                  </Button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <UserCircle size={16} className="mr-2" />
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Package size={16} className="mr-2" />
                        My Orders
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="text-white hover:bg-blue-700 hidden md:flex"
                  onClick={() => navigate('/auth')}
                >
                  <User size={20} className="mr-2" />
                  Login
                </Button>
              )}
              
              <Button
                variant="ghost"
                className="text-white hover:bg-blue-700 relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={20} />
                <span className="ml-2 hidden md:inline">Cart</span>
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2 border-0 text-gray-900"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 px-3"
                >
                  <Search size={16} />
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-blue-500 bg-blue-700">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full text-left text-white hover:bg-blue-600 justify-start"
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                  >
                    <UserCircle size={20} className="mr-2" />
                    My Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-left text-white hover:bg-blue-600 justify-start"
                    onClick={() => {
                      navigate('/orders');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Package size={20} className="mr-2" />
                    My Orders
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-left text-white hover:bg-blue-600 justify-start"
                    onClick={handleSignOut}
                  >
                    <User size={20} className="mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full text-left text-white hover:bg-blue-600 justify-start"
                  onClick={() => navigate('/auth')}
                >
                  <User size={20} className="mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
