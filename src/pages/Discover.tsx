import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { PlayCircle, BookOpen, Bookmark, Search } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';
import api from '../api/axios';
import { useWellnessStore } from '../store/useWellnessStore';
import './Discover.css';

export interface ContentItem {
  id: number;
  title: string;
  type: string; // 'article' | 'guided_meditation' | 'practice'
  category: string;
  tags: string[];
  coverImageUrl: string;
  durationMinutes: number;
}

const CATEGORIES = ['All', 'Mindfulness', 'Self-Love', 'Sleep', 'Breathwork', 'Focus'];

export const Discover: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const toggleSave = useWellnessStore(state => state.toggleSaveContent);
  const isSaved = useWellnessStore(state => state.isSaved);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await api.get('/content');
      // Adding dummy data if backend is empty for visual testing
      if (response.data.length === 0) {
        setContent(DUMMY_CONTENT);
      } else {
        setContent(response.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load content. Please try again.');
      setContent(DUMMY_CONTENT); // fallback to dummy data for UI display if backend fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const filteredContent = content.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredContent = content.slice(0, 3); // Just pick first 3 as featured for now

  return (
    <PageWrapper>
      <div className="discover-page">
        <header className="discover-header">
          <div style={{ marginBottom: '16px' }}><BackButton /></div>
          <h1 className="text-h1">Discover</h1>
          <p className="text-body tag-line">A curated library of mindfulness practices, articles, and guided meditations.</p>
        </header>

        {/* Search & Filter */}
        <div className="discover-controls">
          <div className="discover-search">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search practices, articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="category-chips">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="discover-loading">
            <div className="skeleton-hero"></div>
            <div className="skeleton-grid">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          </div>
        ) : error && content.length === 0 ? (
          <div className="discover-error">
            <p>{error}</p>
            <button className="btn-primary" onClick={fetchContent}>Retry</button>
          </div>
        ) : (
          <>
            {/* Featured Carousel */}
            {activeCategory === 'All' && !searchQuery && (
              <section className="featured-section">
                <h2 className="section-title text-h3">Editor's Picks</h2>
                <div className="featured-carousel">
                  {featuredContent.map(item => (
                    <div key={item.id} className="featured-card">
                      <img src={item.coverImageUrl} alt={item.title} className="featured-image" />
                      <div className="featured-overlay">
                        <div className="featured-meta">
                          <span className="content-type">
                            {item.type === 'article' ? <BookOpen size={14} /> : <PlayCircle size={14} />}
                            {item.durationMinutes} min
                          </span>
                          <button 
                            className={`save-btn ${isSaved(item.id.toString()) ? 'saved' : ''}`}
                            onClick={(e) => { e.preventDefault(); toggleSave(item.id.toString()); }}
                            aria-label="Save content"
                          >
                            <Bookmark size={20} fill={isSaved(item.id.toString()) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        <h3 className="featured-title">{item.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Main Feed */}
            <section className="feed-section">
              <h2 className="section-title text-h3">{searchQuery ? 'Search Results' : 'Explore Library'}</h2>
              
              {filteredContent.length === 0 ? (
                <div className="discover-empty">
                  <p className="text-body">No content found matching your criteria.</p>
                  <button className="btn-secondary" onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}>Clear Filters</button>
                </div>
              ) : (
                <div className="content-grid">
                  {filteredContent.map(item => (
                    <div key={item.id} className="content-card">
                      <div className="content-image-wrapper">
                        <img src={item.coverImageUrl} alt={item.title} className="content-image" />
                        <button 
                          className={`save-btn corner ${isSaved(item.id.toString()) ? 'saved' : ''}`}
                          onClick={(e) => { e.preventDefault(); toggleSave(item.id.toString()); }}
                        >
                          <Bookmark size={18} fill={isSaved(item.id.toString()) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="content-info">
                        <div className="content-meta">
                          <span className="content-category">{item.category}</span>
                          <span className="content-duration">
                            {item.type === 'article' ? <BookOpen size={12} /> : <PlayCircle size={12} />}
                            {item.durationMinutes}m
                          </span>
                        </div>
                        <h4 className="content-title">{item.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

// Dummy data for visual presentation since backend is empty initially
const DUMMY_CONTENT: ContentItem[] = [
  {
    id: 1,
    title: "Morning Breathwork for Clarity",
    type: "practice",
    category: "Breathwork",
    tags: ["morning", "focus", "energy"],
    coverImageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    durationMinutes: 10
  },
  {
    id: 2,
    title: "The Science of Deep Sleep",
    type: "article",
    category: "Sleep",
    tags: ["science", "rest", "habits"],
    coverImageUrl: "https://images.unsplash.com/photo-1517869662479-acba036a18cb?auto=format&fit=crop&q=80&w=800",
    durationMinutes: 5
  },
  {
    id: 3,
    title: "Guided Meditation for Anxiety",
    type: "guided_meditation",
    category: "Mindfulness",
    tags: ["anxiety", "calm", "evening"],
    coverImageUrl: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=800",
    durationMinutes: 15
  },
  {
    id: 4,
    title: "Cultivating Self-Compassion",
    type: "article",
    category: "Self-Love",
    tags: ["compassion", "growth"],
    coverImageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800",
    durationMinutes: 8
  }
];
