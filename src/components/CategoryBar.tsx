
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

type Category = Tables<'categories'>;

const CategoryBar = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      setCategories(data || []);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto py-3 space-x-8 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className="flex flex-col items-center space-y-1 min-w-max group hover:text-blue-600 transition-colors"
            >
              {category.image_url && (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform"
                />
              )}
              <span className="text-sm font-medium whitespace-nowrap">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
