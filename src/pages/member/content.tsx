'use client'
// src/pages/member/content.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import { 
  FileText, 
  Video, 
  Calendar, 
  Search,
  Filter,
  Heart,
  Star,
  Play,
  Book,
  BookOpen,
  Headphones,
  Monitor,
  Archive,
  ExternalLink,
  Clock,
  Eye,
  TrendingUp,
  Lock,
  Crown,
  AlertCircle,
  X,
  Download,
  Share,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

interface Content {
  _id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  publishDate: string;
  restricted: boolean;
  planId?: string;
  plan?: { _id: string; name: string };
  views?: number;
  engagement?: number;
  thumbnail?: string;
  isFavorite?: boolean;
  hasAccess?: boolean;
}

function MyContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAccess, setFilterAccess] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentTab, setCurrentTab] = useState('all');

  const contentTypes = [
    { value: 'Article', label: 'Article', icon: FileText, action: 'Read' },
    { value: 'Video', label: 'Video', icon: Video, action: 'Watch' },
    { value: 'Event', label: 'Event', icon: Calendar, action: 'Join' },
    { value: 'Podcast', label: 'Podcast', icon: Headphones, action: 'Listen' },
    { value: 'Course', label: 'Course', icon: BookOpen, action: 'Start' },
    { value: 'Webinar', label: 'Webinar', icon: Monitor, action: 'Watch' },
    { value: 'Other', label: 'Other', icon: Archive, action: 'View More' },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchContents();
    }
  }, [status]);

  useEffect(() => {
    filterAndSortContent();
  }, [contents, searchTerm, filterType, filterAccess, sortBy, currentTab]);

  const fetchContents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/member/content');
      const data = await res.json();
      if (data.success) {
        setContents(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading content');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortContent = () => {
    let filtered = contents;

    // Filter by tab
    if (currentTab === 'favorites') {
      filtered = filtered.filter(content => content.isFavorite);
    } else if (currentTab === 'accessible') {
      filtered = filtered.filter(content => content.hasAccess);
    } else if (currentTab === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(content => new Date(content.publishDate) >= oneWeekAgo);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType) {
      filtered = filtered.filter(content => content.type === filterType);
    }

    // Filter by access
    if (filterAccess === 'accessible') {
      filtered = filtered.filter(content => content.hasAccess);
    } else if (filterAccess === 'restricted') {
      filtered = filtered.filter(content => !content.hasAccess);
    }

    // Sort content
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
        case 'popular':
          return (b.views || 0) - (a.views || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      }
    });

    setFilteredContents(filtered);
  };

  const toggleFavorite = async (contentId: string) => {
    try {
      const res = await fetch('/api/member/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      });
      const data = await res.json();
      if (data.success) {
        setContents(contents.map(c => 
          c._id === contentId ? { ...c, isFavorite: !c.isFavorite } : c
        ));
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleContentClick = (content: Content) => {
    if (!content.hasAccess) {
      router.push('/member/plans');
      return;
    }

    if (content.url) {
      window.open(content.url, '_blank');
    }
    
    // Track view
    fetch('/api/member/view-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: content._id }),
    }).catch(console.error);
  };

  const getTypeConfig = (type: string) => {
    return contentTypes.find(t => t.value === type) || contentTypes[0];
  };

  const ContentCard = ({ content }: { content: Content }) => {
    const typeConfig = getTypeConfig(content.type);
    const IconComponent = typeConfig.icon;

    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border ${
        !content.hasAccess ? 'border-red-500/30' : 'border-slate-700/50'
      } rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] group cursor-pointer`}
      onClick={() => handleContentClick(content)}>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
            content.hasAccess 
              ? typeConfig.value === 'Article' ? 'from-blue-500 to-blue-600' :
                typeConfig.value === 'Video' ? 'from-red-500 to-red-600' :
                typeConfig.value === 'Event' ? 'from-purple-500 to-purple-600' :
                typeConfig.value === 'Podcast' ? 'from-green-500 to-green-600' :
                typeConfig.value === 'Course' ? 'from-orange-500 to-orange-600' :
                typeConfig.value === 'Webinar' ? 'from-indigo-500 to-indigo-600' :
                'from-gray-500 to-gray-600'
              : 'from-gray-600 to-gray-700'
          } flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(content._id);
              }}
              className={`p-2 rounded-full transition-colors ${
                content.isFavorite 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {content.isFavorite ? <Heart className="w-4 h-4 fill-current" /> : <Heart className="w-4 h-4" />}
            </button>

            {/* Access Status */}
            {!content.hasAccess ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                <Lock className="w-3 h-3" />
                Restricted
              </div>
            ) : content.restricted ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                <Eye className="w-3 h-3" />
                Free
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${
            content.hasAccess ? 'text-white' : 'text-slate-400'
          }`}>
            {content.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-3 mb-3">{content.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(content.publishDate).toLocaleDateString('en-US')}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {content.views || 0}
            </span>
            {content.plan && (
              <span className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {content.plan.name}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-700">
          {!content.hasAccess ? (
            <div className="text-center">
              <p className="text-red-400 text-sm mb-2">Upgrade required to access</p>
              <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                <Crown className="w-4 h-4" />
                Upgrade Plan
              </button>
            </div>
          ) : (
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              {typeConfig.action}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <Layout activeTab="member-content">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Loading content...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout activeTab="member-content">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">Access denied</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab="member-content">
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            My Content
          </h1>
          <p className="text-slate-400">Explore and access your exclusive content</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All Content', icon: Book },
            { key: 'accessible', label: 'Accessible', icon: Eye },
            { key: 'favorites', label: 'Favorites', icon: Heart },
            { key: 'recent', label: 'Recent', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTab === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All types</option>
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={filterAccess}
              onChange={(e) => setFilterAccess(e.target.value)}
              className="bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All content</option>
              <option value="accessible">Accessible</option>
              <option value="restricted">Restricted</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="popular">Most popular</option>
              <option value="title">By title</option>
            </select>
          </div>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{contents.length}</p>
                <p className="text-slate-400 text-sm">Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {contents.filter(c => c.hasAccess).length}
                </p>
                <p className="text-slate-400 text-sm">Accessible</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {contents.filter(c => c.isFavorite).length}
                </p>
                <p className="text-slate-400 text-sm">Favorites</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {Math.round(contents.reduce((acc, c) => acc + (c.views || 0), 0) / contents.length) || 0}
                </p>
                <p className="text-slate-400 text-sm">Avg Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            {currentTab === 'all' ? 'All Content' :
             currentTab === 'favorites' ? 'Favorites' :
             currentTab === 'accessible' ? 'Accessible' :
             'Recent'} ({filteredContents.length})
          </h2>
          
          {filteredContents.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                {currentTab === 'favorites' ? 'No favorites yet' :
                 currentTab === 'accessible' ? 'No accessible content' :
                 'No content found'}
              </h3>
              <p className="text-slate-500 mb-6">
                {currentTab === 'favorites' ? 'Start favoriting content you like' :
                 currentTab === 'accessible' ? 'Upgrade your plan to access more content' :
                 'Try adjusting your search filters'}
              </p>
              {(currentTab === 'accessible' || currentTab === 'all') && (
                <button
                  onClick={() => router.push('/member/plans')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <Crown className="w-5 h-5" />
                  View Plans
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContents.map((content) => (
                <ContentCard key={content._id} content={content} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(MyContentPage);