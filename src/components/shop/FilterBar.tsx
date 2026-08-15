import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import './FilterBar.css';

interface FilterBarProps {
  categories: any[];
  totalResults: number;
}

const FACET_GROUPS = [
  {
    id: 'skinTypeId',
    name: 'Skin Type',
    options: [
      { id: '2', label: 'Oily' },
      { id: '3', label: 'Dry' },
      { id: '4', label: 'Combination' },
      { id: '5', label: 'Sensitive' },
      { id: '6', label: 'Normal' }
    ]
  },
  {
    id: 'concernId',
    name: 'Concern',
    options: [
      { id: '1', label: 'Dryness / Dehydration' },
      { id: '2', label: 'Dullness / Uneven Tone' },
      { id: '3', label: 'Sensitivity / Redness' },
      { id: '4', label: 'Blemishes / Acne-Prone' },
      { id: '5', label: 'Anti-Aging / Fine Lines' },
      { id: '6', label: 'Universal / Everyday Care' }
    ]
  },
  {
    id: 'ingredient',
    name: 'Ingredient',
    options: [
      { id: 'Hyaluronic Acid', label: 'Hyaluronic Acid' },
      { id: 'Vitamin C', label: 'Vitamin C' },
      { id: 'Niacinamide', label: 'Niacinamide' },
      { id: 'Salicylic Acid', label: 'Salicylic Acid' },
      { id: 'Retinol', label: 'Retinol' },
      { id: 'Peptides', label: 'Peptides' }
    ]
  }
];

export const FilterBar: React.FC<FilterBarProps> = ({ categories, totalResults }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [panelOpen, setPanelOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Local state for the panel (so Apply triggers URL change)
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>({});
  const [localMinPrice, setLocalMinPrice] = useState<string>('0');
  const [localMaxPrice, setLocalMaxPrice] = useState<string>('10000');

  // Initialize from URL
  useEffect(() => {
    const filters: Record<string, string[]> = {};
    FACET_GROUPS.forEach(group => {
      filters[group.id] = searchParams.getAll(group.id);
    });
    setLocalFilters(filters);
    setLocalMinPrice(searchParams.get('minPrice') || '0');
    setLocalMaxPrice(searchParams.get('maxPrice') || '10000');
  }, [searchParams]);

  // Click outside for sort dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId === '') {
      newParams.delete('categoryId');
    } else {
      newParams.set('categoryId', categoryId);
    }
    setSearchParams(newParams);
  };

  const handleSortClick = (sortValue: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', sortValue);
    setSearchParams(newParams);
    setSortOpen(false);
  };

  const toggleLocalFacet = (groupId: string, optionId: string) => {
    setLocalFilters(prev => {
      const current = prev[groupId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter(id => id !== optionId) };
      } else {
        return { ...prev, [groupId]: [...current, optionId] };
      }
    });
  };

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    FACET_GROUPS.forEach(group => {
      newParams.delete(group.id);
      localFilters[group.id]?.forEach(val => {
        newParams.append(group.id, val);
      });
    });
    
    if (localMinPrice !== '0') newParams.set('minPrice', localMinPrice);
    else newParams.delete('minPrice');
    
    if (localMaxPrice !== '10000') newParams.set('maxPrice', localMaxPrice);
    else newParams.delete('maxPrice');
    
    setSearchParams(newParams);
    setPanelOpen(false);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    // Preserve category and sort
    if (searchParams.has('categoryId')) newParams.set('categoryId', searchParams.get('categoryId')!);
    if (searchParams.has('sortBy')) newParams.set('sortBy', searchParams.get('sortBy')!);
    if (searchParams.has('search')) newParams.set('search', searchParams.get('search')!);
    
    setSearchParams(newParams);
    setLocalFilters({});
    setLocalMinPrice('0');
    setLocalMaxPrice('10000');
    setPanelOpen(false);
  };

  const removeActiveFilter = (groupId: string, optionId: string) => {
    const newParams = new URLSearchParams(searchParams);
    const values = newParams.getAll(groupId).filter(val => val !== optionId);
    newParams.delete(groupId);
    values.forEach(val => newParams.append(groupId, val));
    setSearchParams(newParams);
  };

  const removeActivePrice = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('minPrice');
    newParams.delete('maxPrice');
    setSearchParams(newParams);
  };

  const activeCategory = searchParams.get('categoryId') || '';
  const currentSort = searchParams.get('sortBy') || 'createdAt';

  // Compute active filters for pills
  const activeFilterPills: Array<{ groupId: string; optionId: string; label: string }> = [];
  FACET_GROUPS.forEach(group => {
    const values = searchParams.getAll(group.id);
    values.forEach(val => {
      const option = group.options.find(o => o.id === val);
      if (option) {
        activeFilterPills.push({ groupId: group.id, optionId: val, label: option.label });
      }
    });
  });
  const hasPriceFilter = searchParams.has('minPrice') || searchParams.has('maxPrice');

  return (
    <div className="filter-bar-container">
      {/* Category Row */}
      <div className="category-chips-row">
        <button 
          className={`category-chip ${activeCategory === '' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('')}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat.categoryId}
            className={`category-chip ${activeCategory === cat.categoryId.toString() ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.categoryId.toString())}
          >
            {cat.categoryName}
          </button>
        ))}
      </div>

      {/* Utility Bar */}
      <div className="utility-bar">
        <div className="results-count">{totalResults} results</div>
        <div className="utility-actions">
          <div ref={sortRef} style={{ position: 'relative' }}>
            <button 
              className={`utility-btn ${sortOpen ? 'active' : ''}`}
              onClick={() => setSortOpen(!sortOpen)}
            >
              Sort <ChevronDown size={14} />
            </button>
            {sortOpen && (
              <div className="sort-dropdown-anchored">
                <button className={`sort-option ${currentSort === 'createdAt' ? 'active' : ''}`} onClick={() => handleSortClick('createdAt')}>Newest</button>
                <button className={`sort-option ${currentSort === 'price-asc' ? 'active' : ''}`} onClick={() => handleSortClick('price-asc')}>Price: Low-High</button>
                <button className={`sort-option ${currentSort === 'price-desc' ? 'active' : ''}`} onClick={() => handleSortClick('price-desc')}>Price: High-Low</button>
                <button className={`sort-option ${currentSort === 'rating' ? 'active' : ''}`} onClick={() => handleSortClick('rating')}>Recommended</button>
              </div>
            )}
          </div>
          <button 
            className={`utility-btn ${panelOpen ? 'active' : ''}`}
            onClick={() => setPanelOpen(!panelOpen)}
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>
      </div>

      {/* Active Filters Row (Above Panel) */}
      {(activeFilterPills.length > 0 || hasPriceFilter) && (
        <div className="active-filters-row">
          {activeFilterPills.map(pill => (
            <div key={`${pill.groupId}-${pill.optionId}`} className="active-filter-pill">
              {pill.label}
              <button onClick={() => removeActiveFilter(pill.groupId, pill.optionId)}><X size={12} /></button>
            </div>
          ))}
          {hasPriceFilter && (
            <div className="active-filter-pill">
              ₹{searchParams.get('minPrice') || 0} - ₹{searchParams.get('maxPrice') || 10000}
              <button onClick={() => removeActivePrice()}><X size={12} /></button>
            </div>
          )}
          <button className="clear-all-text" onClick={clearAllFilters}>Clear all</button>
        </div>
      )}

      {/* Inline Accordion Panel */}
      <div className={`filter-panel-wrapper ${panelOpen ? 'open' : ''}`}>
        <div className="filter-panel-content">
          {FACET_GROUPS.map(group => (
            <div key={group.id} className="facet-group">
              <span className="facet-eyebrow">{group.name}</span>
              <div className="facet-options">
                {group.options.map(opt => {
                  const isSelected = localFilters[group.id]?.includes(opt.id);
                  return (
                    <button 
                      key={opt.id}
                      className={`facet-pill ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleLocalFacet(group.id, opt.id)}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="facet-group" style={{ minWidth: '250px' }}>
            <span className="facet-eyebrow">Price Range</span>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div className="price-display">Up to ₹{localMaxPrice}</div>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="100" 
                value={localMaxPrice} 
                onChange={(e) => setLocalMaxPrice(e.target.value)} 
                className="price-slider-input" 
              />
              <div className="price-labels">
                <span>₹0</span>
                <span>₹10,000+</span>
              </div>
            </div>
          </div>
        </div>

        <div className="filter-panel-footer">
          <button className="footer-clear" onClick={() => {
            setLocalFilters({});
            setLocalMinPrice('0');
            setLocalMaxPrice('10000');
          }}>
            Clear all
          </button>
          <button className="footer-apply" onClick={applyFilters}>
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
};
