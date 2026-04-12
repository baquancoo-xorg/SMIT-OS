import React from 'react';

export default function Settings() {
  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-8 w-full">
      <div>
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Settings</h2>
        <p className="text-slate-500 mt-2">Manage your workspace preferences.</p>
      </div>
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <p className="text-slate-500">Settings configuration will go here.</p>
      </div>
    </div>
  );
}
