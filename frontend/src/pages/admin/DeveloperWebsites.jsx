import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { developerWebsitesApi } from '../../services/api';
import PageLoader from '../../components/ui/PageLoader';
import { Plus, Trash2, Globe } from 'lucide-react';

export default function AdminDeveloperWebsites() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['developerWebsites'],
    queryFn: () => developerWebsitesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: developerWebsitesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developerWebsites'] });
      setName('');
      setUrl('');
      setIconUrl('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: developerWebsitesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developerWebsites'] });
    }
  });

  if (isLoading) return <PageLoader />;

  const websites = data?.websites || [];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !url) return;
    createMutation.mutate({ name, url, iconUrl });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Developer Websites</h1>
          <p className="text-[#8E8E93]">Manage the links that appear in the user sidebar navigation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/5 space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Add New Website</h2>
            
            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-1">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Loga Studio"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#0A84FF] transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-1">URL</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#0A84FF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8E8E93] mb-1">Icon URL (Optional)</label>
              <input
                type="url"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#0A84FF] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full mt-4 bg-[#0A84FF] text-white font-semibold py-3 rounded-xl hover:bg-[#0A84FF]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              {createMutation.isPending ? 'Adding...' : 'Add Website'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#1C1C1E] rounded-2xl border border-white/5 overflow-hidden">
            {websites.length === 0 ? (
              <div className="p-8 text-center text-[#8E8E93]">
                <Globe size={48} className="mx-auto mb-4 opacity-20" />
                <p>No developer websites added yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {websites.map((website) => (
                  <div key={website.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      {website.iconUrl ? (
                        <img src={website.iconUrl} alt={website.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <Globe size={20} className="text-[#8E8E93]" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-white">{website.name}</h3>
                        <a href={website.url} target="_blank" rel="noreferrer" className="text-sm text-[#0A84FF] hover:underline">
                          {website.url}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(website.id)}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
