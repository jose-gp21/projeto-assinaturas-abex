'use client'
// src/pages/admin/content.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import { 
  FileText, 
  Video, 
  Calendar, 
  Globe, 
  Lock, 
  Eye, 
  EyeOff,
  Plus, 
  Edit3, 
  Trash2, 
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  Upload,
  Link,
  Crown,
  Users,
  Zap,
  Play,
  BookOpen,
  Image as ImageIcon,
  Music,
  FileVideo,
  Headphones,
  Monitor,
  Smartphone,
  Archive,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Settings,
  Tag,
  Clock,
  TrendingUp
} from 'lucide-react';

interface Content {
  _id: string;
  title: string;
  description: string;
  publishDate: string;
  type: string;
  url?: string;
  restricted: boolean;
  planId?: string;
  plan?: { _id: string; name: string };
  active?: boolean;
  views?: number;
  engagement?: number;
  thumbnail?: string;
}

interface Plan {
  _id: string;
  name: string;
}

const contentTypes = [
  { value: 'Article', label: 'Article', icon: FileText, color: 'blue' },
  { value: 'Video', label: 'Video', icon: Video, color: 'red' },
  { value: 'Event', label: 'Event', icon: Calendar, color: 'purple' },
  { value: 'Podcast', label: 'Podcast', icon: Headphones, color: 'green' },
  { value: 'Course', label: 'Course', icon: BookOpen, color: 'orange' },
  { value: 'Webinar', label: 'Webinar', icon: Monitor, color: 'indigo' },
  { value: 'Other', label: 'Other', icon: Archive, color: 'gray' },
];

function ManageContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRestricted, setFilterRestricted] = useState('');
  
  const [form, setForm] = useState<Partial<Content>>({
    title: '',
    description: '',
    type: 'Article',
    url: '',
    restricted: true,
    planId: '',
    active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  useEffect(() => {
    filterContent();
  }, [contents, searchTerm, filterType, filterRestricted]);

  const filterContent = () => {
    let filtered = contents;

    if (searchTerm) {
      filtered = filtered.filter(content => 
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(content => content.type === filterType);
    }

    if (filterRestricted !== '') {
      filtered = filtered.filter(content => 
        filterRestricted === 'true' ? content.restricted : !content.restricted
      );
    }

    setFilteredContents(filtered);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resContents, resPlans] = await Promise.all([
        fetch('/api/admin/content'),
        fetch('/api/admin/plans')
      ]);

      const [dataContents, dataPlans] = await Promise.all([
        resContents.json(),
        resPlans.json()
      ]);

      if (dataContents.success) {
        setContents(dataContents.data);
      } else {
        setError(dataContents.message);
      }

      if (dataPlans.success) {
        setAvailablePlans(dataPlans.data);
      } else {
        setError(dataPlans.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormLoading(true);

    const method = isEditing ? 'PUT' : 'POST';
    const url = '/api/admin/content';
    const body = isEditing ? { ...form, id: currentContentId } : form;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchData();
        setShowForm(false);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error saving content.');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'Article',
      url: '',
      restricted: true,
      planId: '',
      active: true,
    });
    setIsEditing(false);
    setCurrentContentId(null);
    setError(null);
  };

  const handleEdit = (content: Content) => {
    setForm({
      title: content.title,
      description: content.description,
      type: content.type,
      url: content.url,
      restricted: content.restricted,
      planId: content.planId || '',
      active: content.active !== false,
    });
    setIsEditing(true);
    setCurrentContentId(content._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting content.');
    }
  };

  const toggleContentStatus = async (id: string, active: boolean) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error updating status.');
    }
  };

  const getTypeConfig = (type: string) => {
    return contentTypes.find(t => t.value === type) || contentTypes[0];
  };

  const ContentCard = ({ content }: { content: Content }) => {
    const typeConfig = getTypeConfig(content.type);
    const IconComponent = typeConfig.icon;

    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] group">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
            typeConfig.color === 'blue' ? 'from-blue-500 to-blue-600' :
            typeConfig.color === 'red' ? 'from-red-500 to-red-600' :
            typeConfig.color === 'purple' ? 'from-purple-500 to-purple-600' :
            typeConfig.color === 'green' ? 'from-green-500 to-green-600' :
            typeConfig.color === 'orange' ? 'from-orange-500 to-orange-600' :
            typeConfig.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
            'from-gray-500 to-gray-600'
          } flex items-center justify-center shadow-lg`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <button
              onClick={() => toggleContentStatus(content._id, content.active !== false)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                content.active !== false 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }`}
            >
              {content.active !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {content.active !== false ? 'Active' : 'Inactive'}
            </button>

            {/* Restricted Badge */}
            {content.restricted && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                <Lock className="w-3 h-3" />
                Restricted
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{content.title}</h3>
          <p className="text-slate-400 text-sm line-clamp-3 mb-3">{content.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {typeConfig.label}
            </span>
            {content.plan && (
              <span className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {content.plan.name}
              </span>
            )}
            {content.url && (
              <span className="flex items-center gap-1">
                <Link className="w-3 h-3" />
                External URL
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-400">
              <Eye className="w-4 h-4" />
              {content.views || 0}
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <TrendingUp className="w-4 h-4" />
              {content.engagement || 0}%
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {new Date(content.publishDate).toLocaleDateString('en-US')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(content)}
            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          {content.url && (
            <button
              onClick={() => window.open(content.url, '_blank')}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDelete(content._id, content.title)}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <Layout >
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
      <Layout activeTab='admin-content'>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">Access denied. Please login as administrator.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeTab='admin-content'>
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Manage Content
            </h1>
            <p className="text-slate-400">Create and manage your platform's exclusive content</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Content
            </button>
          </div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
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
                  {contents.filter(c => c.active !== false).length}
                </p>
                <p className="text-slate-400 text-sm">Active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {contents.filter(c => c.restricted).length}
                </p>
                <p className="text-slate-400 text-sm">Restricted</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {Math.round(contents.reduce((acc, c) => acc + (c.engagement || 0), 0) / contents.length) || 0}%
                </p>
                <p className="text-slate-400 text-sm">Engagement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
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
              value={filterRestricted}
              onChange={(e) => setFilterRestricted(e.target.value)}
              className="bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All</option>
              <option value="true">Restricted only</option>
              <option value="false">Public only</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            Registered Content ({filteredContents.length})
          </h2>
          
          {filteredContents.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                {contents.length === 0 ? 'No content registered' : 'No content found'}
              </h3>
              <p className="text-slate-500 mb-6">
                {contents.length === 0 
                  ? 'Start by creating your first exclusive content'
                  : 'Try adjusting the search filters'
                }
              </p>
              {contents.length === 0 && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Create First Content
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {isEditing ? <Edit3 className="w-6 h-6 text-blue-400" /> : <Plus className="w-6 h-6 text-purple-400" />}
                  {isEditing ? 'Edit Content' : 'Create New Content'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Content title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      value={form.type || 'Article'}
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      {contentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe the content..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      External URL (optional)
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        name="url"
                        value={form.url || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Associate with Plan
                    </label>
                    <div className="relative">
                      <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        name="planId"
                        value={form.planId || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Public or All Subscribers</option>
                        {availablePlans.map((plan) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="restricted"
                      checked={form.restricted || false}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-2 border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-slate-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Restricted content (subscribers only)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={form.active !== false}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-2 border-slate-600 text-green-500 focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-slate-300 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Active content
                    </span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {formLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {formLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Content'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(ManageContentPage, { requiresAdmin: true });