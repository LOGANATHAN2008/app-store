import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { developerWebsitesApi } from '../services/api';
import PageLoader from '../components/ui/PageLoader';
import { motion } from 'framer-motion';
import { Globe, ExternalLink } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function DeveloperWebsitesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['developerWebsites'],
    queryFn: () => developerWebsitesApi.getAll(),
  });

  if (isLoading) return <PageLoader />;

  const websites = data?.websites || [];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="page-container pb-24" style={{ maxWidth: 1400 }}>
      {/* Header */}
      <div className="pt-6 pb-8 border-b border-white/10 mb-8">
        <h1 className="text-[38px] md:text-[46px] font-[800] tracking-tight leading-none text-white flex items-center gap-4">
          Developer Websites <Globe className="w-10 h-10 text-[#0A84FF]" />
        </h1>
        <p className="mt-4 text-[#8E8E93] text-lg max-w-2xl">
          Discover the brilliant minds behind your favorite apps. Explore their official portfolios and connect with top developers.
        </p>
      </div>

      {websites.length === 0 ? (
        <div className="flex flex-col items-center py-32 text-center">
          <Globe size={64} className="text-[#8E8E93] mb-6 opacity-20" />
          <h2 className="text-2xl font-bold text-white mb-2">No Websites Yet</h2>
          <p className="text-[#8E8E93]">Check back soon for featured developer portfolios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((site) => (
            <motion.a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#1C1C1E] rounded-2xl p-6 border border-white/5 hover:bg-white/5 transition-colors group flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="text-[#0A84FF] w-5 h-5" />
              </div>

              {site.iconUrl ? (
                <img src={site.iconUrl} alt={site.name} className="w-20 h-20 rounded-2xl object-cover mb-4 shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#0A84FF]/10 flex items-center justify-center mb-4 shadow-lg border border-[#0A84FF]/20">
                  <Globe className="w-10 h-10 text-[#0A84FF]" />
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-1">{site.name}</h3>
              <p className="text-[13px] text-[#0A84FF] font-medium">{site.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
            </motion.a>
          ))}
        </div>
      )}
    </motion.div>
  );
}
