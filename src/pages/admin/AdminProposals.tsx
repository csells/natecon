import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Check, X } from 'lucide-react';

interface TalkProposal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  length: string;
  status: string;
  created_at: string;
  profiles: {
    name: string | null;
    email: string;
  } | null;
}

export default function AdminProposals() {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [proposals, setProposals] = useState<TalkProposal[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<TalkProposal[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    if (!loading && !isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProposals();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredProposals(proposals);
    } else {
      setFilteredProposals(proposals.filter((p) => p.status === statusFilter));
    }
  }, [proposals, statusFilter]);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('talk_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      const proposalsWithProfiles = (data || []).map(p => ({
        ...p,
        profiles: profileMap.get(p.user_id) || null
      }));

      setProposals(proposalsWithProfiles as TalkProposal[]);
      setFilteredProposals(proposalsWithProfiles as TalkProposal[]);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const updateStatus = async (proposalId: string, newStatus: string) => {
    setUpdating(proposalId);
    try {
      const { error } = await supabase
        .from('talk_proposals')
        .update({ status: newStatus })
        .eq('id', proposalId);

      if (error) throw error;

      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: newStatus } : p))
      );

      toast.success(`Proposal ${newStatus === 'accepted' ? 'accepted' : 'rejected'}`);
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error('Failed to update proposal');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Link to="/admin" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Talk Proposals</h1>
                  <p className="text-muted-foreground">{filteredProposals.length} proposals</p>
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Proposals Table */}
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Speaker</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Length</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProposals.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">
                            {p.profiles?.name || p.profiles?.email || '—'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{p.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {p.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {p.length === 'lightning' ? '15 min' : '45 min'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(p.status)}>{p.status}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                onClick={() => updateStatus(p.id, 'accepted')}
                                disabled={updating === p.id || p.status === 'accepted'}
                              >
                                {updating === p.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                onClick={() => updateStatus(p.id, 'rejected')}
                                disabled={updating === p.id || p.status === 'rejected'}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
