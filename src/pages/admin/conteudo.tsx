'use client'
// src/pages/admin/conteudo.tsx
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

interface Conteudo {
  _id: string;
  titulo: string;
  descricao: string;
  dataPublicacao: string;
  tipo: string;
  url?: string;
  restrito: boolean;
  planoId?: string;
  plano?: { _id: string; nome: string };
  ativo?: boolean;
  views?: number;
  engagement?: number;
  thumbnail?: string;
}

interface Plano {
  _id: string;
  nome: string;
}

const contentTypes = [
  { value: 'Artigo', label: 'Artigo', icon: FileText, color: 'blue' },
  { value: 'Video', label: 'Vídeo', icon: Video, color: 'red' },
  { value: 'Evento', label: 'Evento', icon: Calendar, color: 'purple' },
  { value: 'Podcast', label: 'Podcast', icon: Headphones, color: 'green' },
  { value: 'Curso', label: 'Curso', icon: BookOpen, color: 'orange' },
  { value: 'Webinar', label: 'Webinar', icon: Monitor, color: 'indigo' },
  { value: 'Outro', label: 'Outro', icon: Archive, color: 'gray' },
];

function GerenciarConteudoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [filteredConteudos, setFilteredConteudos] = useState<Conteudo[]>([]);
  const [planosDisponiveis, setPlanosDisponiveis] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRestricted, setFilterRestricted] = useState('');
  
  const [form, setForm] = useState<Partial<Conteudo>>({
    titulo: '',
    descricao: '',
    tipo: 'Artigo',
    url: '',
    restrito: true,
    planoId: '',
    ativo: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentConteudoId, setCurrentConteudoId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  useEffect(() => {
    filterContent();
  }, [conteudos, searchTerm, filterType, filterRestricted]);

  const filterContent = () => {
    let filtered = conteudos;

    if (searchTerm) {
      filtered = filtered.filter(content => 
        content.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(content => content.tipo === filterType);
    }

    if (filterRestricted !== '') {
      filtered = filtered.filter(content => 
        filterRestricted === 'true' ? content.restrito : !content.restrito
      );
    }

    setFilteredConteudos(filtered);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resConteudos, resPlanos] = await Promise.all([
        fetch('/api/admin/conteudo'),
        fetch('/api/admin/planos')
      ]);

      const [dataConteudos, dataPlanos] = await Promise.all([
        resConteudos.json(),
        resPlanos.json()
      ]);

      if (dataConteudos.success) {
        setConteudos(dataConteudos.data);
      } else {
        setError(dataConteudos.message);
      }

      if (dataPlanos.success) {
        setPlanosDisponiveis(dataPlanos.data);
      } else {
        setError(dataPlanos.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados.');
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
    const url = '/api/admin/conteudo';
    const body = isEditing ? { ...form, id: currentConteudoId } : form;

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
      setError(err.message || 'Erro ao salvar conteúdo.');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      titulo: '',
      descricao: '',
      tipo: 'Artigo',
      url: '',
      restrito: true,
      planoId: '',
      ativo: true,
    });
    setIsEditing(false);
    setCurrentConteudoId(null);
    setError(null);
  };

  const handleEdit = (conteudo: Conteudo) => {
    setForm({
      titulo: conteudo.titulo,
      descricao: conteudo.descricao,
      tipo: conteudo.tipo,
      url: conteudo.url,
      restrito: conteudo.restrito,
      planoId: conteudo.planoId || '',
      ativo: conteudo.ativo !== false,
    });
    setIsEditing(true);
    setCurrentConteudoId(conteudo._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${titulo}"?`)) return;

    try {
      const res = await fetch(`/api/admin/conteudo?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir conteúdo.');
    }
  };

  const toggleContentStatus = async (id: string, ativo: boolean) => {
    try {
      const res = await fetch('/api/admin/conteudo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ativo: !ativo }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar status.');
    }
  };

  const getTypeConfig = (tipo: string) => {
    return contentTypes.find(t => t.value === tipo) || contentTypes[0];
  };

  const ContentCard = ({ conteudo }: { conteudo: Conteudo }) => {
    const typeConfig = getTypeConfig(conteudo.tipo);
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
              onClick={() => toggleContentStatus(conteudo._id, conteudo.ativo !== false)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                conteudo.ativo !== false 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }`}
            >
              {conteudo.ativo !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {conteudo.ativo !== false ? 'Ativo' : 'Inativo'}
            </button>

            {/* Restricted Badge */}
            {conteudo.restrito && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                <Lock className="w-3 h-3" />
                Restrito
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{conteudo.titulo}</h3>
          <p className="text-slate-400 text-sm line-clamp-3 mb-3">{conteudo.descricao}</p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {typeConfig.label}
            </span>
            {conteudo.plano && (
              <span className="flex items-center gap-1">
                <Crown className="w-3 h-3" />
                {conteudo.plano.nome}
              </span>
            )}
            {conteudo.url && (
              <span className="flex items-center gap-1">
                <Link className="w-3 h-3" />
                URL externa
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-400">
              <Eye className="w-4 h-4" />
              {conteudo.views || 0}
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <TrendingUp className="w-4 h-4" />
              {conteudo.engagement || 0}%
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {new Date(conteudo.dataPublicacao).toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(conteudo)}
            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </button>
          {conteudo.url && (
            <button
              onClick={() => window.open(conteudo.url, '_blank')}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDelete(conteudo._id, conteudo.titulo)}
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
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Carregando conteúdo...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">Acesso negado. Faça login como administrador.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Gerenciar Conteúdo
            </h1>
            <p className="text-slate-400">Crie e gerencie o conteúdo exclusivo da sua plataforma</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Novo Conteúdo
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
                <p className="text-2xl font-bold text-white">{conteudos.length}</p>
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
                  {conteudos.filter(c => c.ativo !== false).length}
                </p>
                <p className="text-slate-400 text-sm">Ativos</p>
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
                  {conteudos.filter(c => c.restrito).length}
                </p>
                <p className="text-slate-400 text-sm">Restritos</p>
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
                  {Math.round(conteudos.reduce((acc, c) => acc + (c.engagement || 0), 0) / conteudos.length) || 0}%
                </p>
                <p className="text-slate-400 text-sm">Engajamento</p>
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
                  placeholder="Buscar conteúdo..."
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
              <option value="">Todos os tipos</option>
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={filterRestricted}
              onChange={(e) => setFilterRestricted(e.target.value)}
              className="bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos</option>
              <option value="true">Apenas restritos</option>
              <option value="false">Apenas públicos</option>
            </select>
          </div>
        </div>

        {/* Content Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            Conteúdo Cadastrado ({filteredConteudos.length})
          </h2>
          
          {filteredConteudos.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                {conteudos.length === 0 ? 'Nenhum conteúdo cadastrado' : 'Nenhum conteúdo encontrado'}
              </h3>
              <p className="text-slate-500 mb-6">
                {conteudos.length === 0 
                  ? 'Comece criando seu primeiro conteúdo exclusivo'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
              {conteudos.length === 0 && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Criar Primeiro Conteúdo
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConteudos.map((conteudo) => (
                <ContentCard key={conteudo._id} conteudo={conteudo} />
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
                  {isEditing ? 'Editar Conteúdo' : 'Criar Novo Conteúdo'}
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
                      Título *
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      value={form.titulo || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Título do conteúdo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Tipo *
                    </label>
                    <select
                      name="tipo"
                      value={form.tipo || 'Artigo'}
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
                    Descrição *
                  </label>
                  <textarea
                    name="descricao"
                    value={form.descricao || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Descreva o conteúdo..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      URL Externa (opcional)
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        name="url"
                        value={form.url || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://exemplo.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Associar ao Plano
                    </label>
                    <div className="relative">
                      <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        name="planoId"
                        value={form.planoId || ''}
                        onChange={handleChange}
                        className="w-full bg-slate-900/50 border border-slate-600 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Público ou Todos os Assinantes</option>
                        {planosDisponiveis.map((plano) => (
                          <option key={plano._id} value={plano._id}>
                            {plano.nome}
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
                      name="restrito"
                      checked={form.restrito || false}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-2 border-slate-600 text-purple-500 focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-slate-300 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Conteúdo restrito (apenas assinantes)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={form.ativo !== false}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-2 border-slate-600 text-green-500 focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-slate-300 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Conteúdo ativo
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
                    Cancelar
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
                    {formLoading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Conteúdo'}
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

export default withAuth(GerenciarConteudoPage, { requiresAdmin: true });