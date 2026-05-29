import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';

const GuidesList = ({ refreshTrigger }) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('preparedness_guides')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching guides:', error);
    } else if (data) {
      setGuides(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides, refreshTrigger]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchGuides();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchGuides]);

  useEffect(() => {
    const subscription = supabase
      .channel('preparedness_guides_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'preparedness_guides'
        }, 
        () => {
          fetchGuides();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchGuides]);

  if (loading && guides.length === 0) {
    return <div className="loading-guides">Loading preparedness guides...</div>;
  }

  if (guides.length === 0) {
    return <p className="no-data">No preparedness guides available.</p>;
  }

  return (
    <div className="guides-grid">
      {guides.map(guide => (
        <div key={guide.guide_id} className="guide-card">
          <h3>{guide.title}</h3>
          <p>{guide.description}</p>
          {guide.video_url && (
            <a 
              href={guide.video_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="video-link"
            >
              🎥 Watch Video Guide
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default GuidesList;