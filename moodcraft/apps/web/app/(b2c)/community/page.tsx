'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AppHeader } from '@/components/shared/app-header';
import { Users, MessageSquare, Plus, Lock } from 'lucide-react';

interface Circle {
  id: string;
  name: string;
  description: string;
  archetype: string | null;
  memberCount: number;
  maxMembers: number;
  isMember: boolean;
}

interface Post {
  id: string;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
}

export default function CommunityPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCircles();
  }, []);

  async function fetchCircles() {
    try {
      const res = await fetch('/api/community/circles');
      const json = await res.json();
      if (json.success) setCircles(json.data);
    } finally {
      setLoading(false);
    }
  }

  async function selectCircle(circle: Circle) {
    setSelectedCircle(circle);
    if (circle.isMember) {
      const res = await fetch(`/api/community/circles/${circle.id}/posts`);
      const json = await res.json();
      if (json.success) setPosts(json.data);
    }
  }

  async function joinCircle(circleId: string) {
    try {
      await fetch(`/api/community/circles/${circleId}/join`, { method: 'POST' });
      fetchCircles();
    } catch {}
  }

  async function submitPost() {
    if (!newPost.trim() || !selectedCircle) return;
    try {
      await fetch(`/api/community/circles/${selectedCircle.id}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost, isAnonymous: true }),
      });
      setNewPost('');
      // Refresh posts
      const res = await fetch(`/api/community/circles/${selectedCircle.id}/posts`);
      const json = await res.json();
      if (json.success) setPosts(json.data);
    } catch {}
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-midnight p-8 flex items-center justify-center">
        <div className="oracle-spinner" />
      </main>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-gradient-midnight p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-veil-400" />
              Microcircles
            </h1>
            <p className="text-muted-foreground">Connect with others on similar journeys</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Circles List */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground">Available Circles</h2>
              {circles.map((circle) => (
                <Card
                  key={circle.id}
                  className={`glass-card cursor-pointer transition-all ${
                    selectedCircle?.id === circle.id ? 'border-veil-500/50' : 'hover:border-white/20'
                  }`}
                  onClick={() => selectCircle(circle)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{circle.name}</h3>
                      {circle.archetype && (
                        <Badge variant="oracle" className="text-xs">{circle.archetype}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{circle.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {circle.memberCount}/{circle.maxMembers} members
                      </span>
                      {circle.isMember ? (
                        <Badge variant="success" className="text-xs">Joined</Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); joinCircle(circle.id); }}
                        >
                          Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {circles.length === 0 && (
                <p className="text-muted-foreground text-sm">No circles available yet.</p>
              )}
            </div>

            {/* Circle Content */}
            <div className="md:col-span-2">
              {selectedCircle ? (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>{selectedCircle.name}</CardTitle>
                    <CardDescription>{selectedCircle.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedCircle.isMember ? (
                      <>
                        {/* New Post */}
                        <div className="mb-6">
                          <Textarea
                            placeholder="Share with the circle (posted anonymously)..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="bg-white/5 mb-2"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Posts are anonymous by default
                            </span>
                            <Button variant="veil" size="sm" onClick={submitPost} disabled={!newPost.trim()}>
                              <Plus className="w-4 h-4 mr-1" /> Post
                            </Button>
                          </div>
                        </div>

                        {/* Posts */}
                        <div className="space-y-4">
                          {posts.map((post) => (
                            <div key={post.id} className="p-4 rounded-lg bg-white/5">
                              <p className="text-sm mb-2">{post.content}</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{post.isAnonymous ? 'Anonymous' : 'Member'}</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                          {posts.length === 0 && (
                            <p className="text-muted-foreground text-center py-8">
                              No posts yet. Be the first to share.
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">Join this circle to see posts and participate.</p>
                        <Button variant="veil" onClick={() => joinCircle(selectedCircle.id)}>
                          Join Circle
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select a circle to view its content</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
    </>
  );
}
