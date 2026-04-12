import React, { useState } from 'react';

export default function Profile() {
  const [name, setName] = useState('Hoàng Nguyễn');
  const [role, setRole] = useState('Agency PM');
  const [email, setEmail] = useState('hoang.nguyen@example.com');

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-8 w-full">
      <div>
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Edit Profile</h2>
        <p className="text-slate-500 mt-2">Update your personal information.</p>
      </div>
      
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <img 
            src="https://picsum.photos/seed/pm/100/100" 
            alt="User"
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-50 shadow-xl"
            referrerPolicy="no-referrer"
          />
          <div>
            <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              Change Avatar
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Role</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              value={role}
              onChange={e => setRole(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
