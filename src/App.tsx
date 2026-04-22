import React, { useState, useEffect } from 'react';
import getUserSolved from './getUserSolved';

const buttons: number[] = [];
for (let rating = 800; rating <= 3000; rating += 100) {
  buttons.push(rating);
}

function App() {
  const [myHandle, setMyHandle] = useState("");
  const [myHandleSubmitted, setMyHandleSubmitted] = useState("");
  const [friendInput, setFriendInput] = useState("");
  const [friends, setFriends] = useState<string[]>([]);

  const [mySolved, setMySolved] = useState<Set<string>>(new Set());
  const [friendSolved, setFriendSolved] = useState<Map<string, [string, string, number][]>>(new Map());

  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Fetch your solved problems
  useEffect(() => {
    if (!myHandleSubmitted) return;
    getUserSolved(myHandleSubmitted).then(probs => {
      const urls = new Set(probs.map(([, url]) => url));
      setMySolved(urls);
    });
  }, [myHandleSubmitted]);

  // Fetch a new friend's solved problems
  const handleAddFriend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const handle = friendInput.trim();
    if (!handle || friends.includes(handle)) return;

    setFriends(prev => [...prev, handle]);
    getUserSolved(handle).then(probs => {
      setFriendSolved(prev => new Map(prev).set(handle, probs));
    });
    setFriendInput("");
  };

  const handleRemoveFriend = (handle: string) => {
    setFriends(prev => prev.filter(f => f !== handle));
    setFriendSolved(prev => {
      const next = new Map(prev);
      next.delete(handle);
      return next;
    });
  };

  // Aggregate all problems friends solved but you haven't
  const unsolved: [string, string, number][] = [];
  const seen = new Set<string>();

  for (const handle of friends) {
    const probs = friendSolved.get(handle) ?? [];
    for (const [name, url, rating] of probs) {
      if (!mySolved.has(url) && !seen.has(url)) {
        seen.add(url);
        unsolved.push([name, url, rating]);
      }
    }
  }

  const filteredProbs = selectedRating
    ? unsolved.filter(([,, rating]) => rating === selectedRating)
    : unsolved;

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>

      {/* Your handle */}
      <form onSubmit={(e) => { e.preventDefault(); setMyHandleSubmitted(myHandle.trim()); }} style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Your Codeforces handle"
          value={myHandle}
          onChange={(e) => setMyHandle(e.target.value)}
          style={{ marginRight: '8px', padding: '4px 8px' }}
        />
        <button type="submit">Set My Handle</button>
      </form>

      {/* Add friend */}
      <form onSubmit={handleAddFriend} style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Add friend handle"
          value={friendInput}
          onChange={(e) => setFriendInput(e.target.value)}
          style={{ marginRight: '8px', padding: '4px 8px' }}
        />
        <button type="submit">Add Friend</button>
      </form>

      {/* Friends list with remove buttons */}
      {friends.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <strong>Friends:</strong>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            {friends.map(handle => (
              <span key={handle} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                {handle}
                <button onClick={() => handleRemoveFriend(handle)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: 'red' }}>✕</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rating filter buttons */}
      {/* Rating filter buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setSelectedRating(null)}
          style={{ fontWeight: selectedRating === null ? 'bold' : 'normal' }}
        >
          All ({unsolved.length})
        </button>
        {buttons.map(rating => {
          const count = unsolved.filter(([,, r]) => r === rating).length;
          return (
            <button
              key={rating}
              onClick={() => setSelectedRating(rating)}
              style={{ fontWeight: selectedRating === rating ? 'bold' : 'normal', opacity: count === 0 ? 0.4 : 1 }}
            >
              {rating} ({count})
            </button>
          );
        })}
      </div>

      {/* Unsolved problems */}
      {myHandleSubmitted && friends.length > 0 && (
        <ul>
          {filteredProbs.length === 0
            ? <li>No unsolved problems for this rating!</li>
            : filteredProbs.map(([name, url, rating]) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">{name}</a>
                <span style={{ marginLeft: '8px', color: '#888', fontSize: '0.85em' }}>({rating})</span>
              </li>
            ))
          }
        </ul>
      )}

    </div>
  );
}

export default App;