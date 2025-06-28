// src/pages/membro/conteudo.tsx
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import withAuth from '@/components/withAuth';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { 
  FileText, 
  Video, 
  Calendar, 
  Lock, 
  Unlock,
  Play,
  BookOpen,
  Headphones,
  Monitor,
  Archive,
  Crown,
  Star,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Grid,
  List,
  AlertCircle,
  CheckCircle,
  Eye,
  TrendingUp,
  Tag,
  Gift,
  Zap,
  Award,
  Sparkles
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
  views?: number;
  engagement?: number;
  thumbnail?: string;
  duracao?: string;
  rating?: number;
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

function MembroConteudoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [filteredConteudos, setFilteredConteudos] = useState<Conteudo[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStatusAssinatura, setUserStatusAssinatura] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchConteudos();
      // Simular status de assinatura - adapte conforme sua lógica
      setUserStatusAssinatura(session?.user?.role === 'admin' ? 'Ativa' : 'Pendente');
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router, session]);

  useEffect(() => {
    filterContent();
  }, [conteudos, searchTerm, filterType]);

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

    setFilteredConteudos(filtered);
  };

  const fetchConteudos = async () => {
    setLoadingContent(true);
    setError(null);
    try {
      const res = await fetch('/api/membro/conteudo');
      const data = await res.json();
      if (data.success) {
        setConteudos(data.data);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar conteúdos.');
      console.error("Erro no fetchConteudos:", err);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleAcessarConteudo = async (conteudo: Conteudo) => {
    if (conteudo.restrito && userStatusAssinatura !== 'Ativa') {
      router.push('/membro/planos');
      return;
    }

    if (conteudo.url) {
      window.open(conteudo.url, '_blank');
    }
  };

  const getTypeConfig = (tipo: string) => {
    return contentTypes.find(t => t.value === tipo) || contentTypes[0];
  };

  const ContentCard = ({ conteudo }: { conteudo: Conteudo }) => {
    const typeConfig = getTypeConfig(conteudo.tipo);
    const IconComponent = typeConfig.icon;
    const canAccess = !conteudo.restrito || userStatusAssinatura === 'Ativa';

    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:bg-slate-800/70 transition-all duration-300 hover:scale-[1.02] group ${
        !canAccess ? 'opacity-75' : ''
      }`}>
        
        {/* Thumbnail/Header */}
        <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${
            typeConfig.color === 'blue' ? 'from-blue-500 to-blue-600' :
            typeConfig.color === 'red' ? 'from-red-500 to-red-600' :
            typeConfig.color === 'purple' ? 'from-purple-500 to-purple-600' :
            typeConfig.color === 'green' ? 'from-green-500 to-green-600' :
            typeConfig.color === 'orange' ? 'from-orange-500 to-orange-600' :
            typeConfig.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
            'from-gray-500 to-gray-600'
          } flex items-center justify-center shadow-xl`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          
          {/* Overlay badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              typeConfig.color === 'blue' ? 'bg-blue-500/20 text-blue-300' :
              typeConfig.color === 'red' ? 'bg-red-500/20 text-red-300' :
              typeConfig.color === 'purple' ? 'bg-purple-500/20 text-purple-300' :
              typeConfig.color === 'green' ? 'bg-green-500/20 text-green-300' :
              typeConfig.color === 'orange' ? 'bg-orange-500/20 text-orange-300' :
              typeConfig.color === 'indigo' ? 'bg-indigo-500/20 text-indigo-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {typeConfig.label}
            </div>
          </div>

          <div className="absolute top-4 right-4">
            {conteudo.restrito ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                <Unlock className="w-3 h-3" />
                Grátis
              </div>
            )}
          </div>

          {/* Duration badge for videos */}
          {conteudo.tipo === 'Video' && conteudo.duracao && (
            <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-black/50 text-white text-xs font-medium">
              {conteudo.duracao}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
              {conteudo.titulo}
            </h3>
            <p className="text-slate-400 text-sm line-clamp-3 mb-3">{conteudo.descricao}</p>
            
            {conteudo.plano && (
              <div className="flex items-center gap-1 text-xs text-purple-400 mb-2">
                <Crown className="w-3 h-3" />
                {conteudo.plano.nome}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-4">
              {conteudo.views && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {conteudo.views}
                </span>
              )}
              {conteudo.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-yellow-400" />
                  {conteudo.rating.toFixed(1)}
                </span>
              )}
            </div>
            <span>{new Date(conteudo.dataPublicacao).toLocaleDateString('pt-BR')}</span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleAcessarConteudo(conteudo)}
            disabled={!canAccess}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              !canAccess
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105 shadow-lg hover:shadow-purple-500/25'
            }`}
          >
            {!canAccess ? (
              <>
                <Lock className="w-4 h-4" />
                Assine para Acessar
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Acessar Conteúdo
                {conteudo.url && <ExternalLink className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const ContentListItem = ({ conteudo }: { conteudo: Conteudo }) => {
    const typeConfig = getTypeConfig(conteudo.tipo);
    const IconComponent = typeConfig.icon;
    const canAccess = !conteudo.restrito || userStatusAssinatura === 'Ativa';

    return (
      <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/70 transition-all duration-300 ${
        !canAccess ? 'opacity-75' : ''
      }`}>
        <div className="flex items-center gap-6">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${
            typeConfig.color === 'blue' ? 'from-blue-500 to-blue-600' :
            typeConfig.color === 'red' ? 'from-red-500 to-red-600' :
            typeConfig.color === 'purple' ? 'from-purple-500 to-purple-600' :
            typeConfig.color === 'green' ? 'from-green-500 to-green-600' :
            typeConfig.color === 'orange' ? 'from-orange-500 to-orange-600' :
            typeConfig.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
            'from-gray-500 to-gray-600'
          } flex items-center justify-center shadow-lg flex-shrink-0`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-white line-clamp-1">{conteudo.titulo}</h3>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {conteudo.restrito ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300">
                    <Crown className="w-3 h-3" />
                    Premium
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                    <Unlock className="w-3 h-3" />
                    Grátis
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-slate-400 text-sm line-clamp-2 mb-3">{conteudo.descricao}</p>
            
            <div className="flex items-center justify-between">
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
                <span>{new Date(conteudo.dataPublicacao).toLocaleDateString('pt-BR')}</span>
              </div>
              
              <button
                onClick={() => handleAcessarConteudo(conteudo)}
                disabled={!canAccess}
                className={`py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  !canAccess
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105'
                }`}
              >
                {!canAccess ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Assinar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Acessar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (status === 'loading' || loadingContent) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Carregando conteúdos...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg">Acesso negado. Por favor, faça login.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 lg:p-6 max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Conteúdo Exclusivo
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Descubra materiais premium cuidadosamente selecionados para impulsionar seu crescimento
          </p>
        </div>

        {/* Status Alert */}
        {userStatusAssinatura !== 'Ativa' ? (
          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-300 mb-1">Desbloqueie Conteúdo Premium</h3>
                <p className="text-orange-200 text-sm mb-3">
                  Assine um plano para acessar todos os conteúdos exclusivos e acelerar seus resultados
                </p>
                <Link 
                  href="/membro/planos"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                >
                  <Crown className="w-4 h-4" />
                  Ver Planos
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-300 mb-1">Assinatura Ativa!</h3>
                <p className="text-green-200 text-sm">
                  Você tem acesso completo a todos os conteúdos premium
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{conteudos.length}</p>
            <p className="text-slate-400 text-sm">Total Disponível</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">
              {conteudos.filter(c => c.restrito).length}
            </p>
            <p className="text-slate-400 text-sm">Premium</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Unlock className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">
              {conteudos.filter(c => !c.restrito).length}
            </p>
            <p className="text-slate-400 text-sm">Gratuito</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">
              {userStatusAssinatura === 'Ativa' ? conteudos.length : conteudos.filter(c => !c.restrito).length}
            </p>
            <p className="text-slate-400 text-sm">Acessível</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
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
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            Biblioteca de Conteúdo ({filteredConteudos.length})
          </h2>
          
          {filteredConteudos.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                {conteudos.length === 0 ? 'Nenhum conteúdo disponível' : 'Nenhum conteúdo encontrado'}
              </h3>
              <p className="text-slate-500">
                {conteudos.length === 0 
                  ? 'Novos conteúdos serão adicionados em breve'
                  : 'Tente ajustar os filtros de busca'
                }
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredConteudos.map((conteudo) => (
                viewMode === 'grid' ? (
                  <ContentCard key={conteudo._id} conteudo={conteudo} />
                ) : (
                  <ContentListItem key={conteudo._id} conteudo={conteudo} />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(MembroConteudoPage);