"use client";
import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/FormField";

function Toggle({defaultOn=false}:{defaultOn?:boolean}){
  const [on,setOn]=useState(defaultOn);
  return(
    <button onClick={()=>setOn(p=>!p)}
      className={`w-10 h-5 rounded-full transition-all duration-200 relative flex-shrink-0 ${on?"bg-[#12A150]":"bg-[rgba(18,36,28,0.12)]"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${on?"left-5":"left-0.5"}`}/>
    </button>
  );
}

export default function AdminSettingsPage(){
  const [saved,setSaved]=useState(false);
  return(
    <AdminLayout title="Platform Settings">
      <div className="page-enter max-w-xl mx-auto flex flex-col gap-4">
        <div className="rounded-xl border border-[rgba(226,138,30,0.3)] bg-[#FDF0DC] px-4 py-3 text-[13px] text-[#B5761A]">
          <strong>Preview.</strong> These platform controls are display-only in this build — changes aren&apos;t persisted yet. Feature wiring lands with the settings service.
        </div>
        <Card>
          <CardHeader title="Platform Config"/>
          <div className="flex flex-col gap-3">
            <Field label="Platform Name"><Input defaultValue="Handout"/></Field>
            <Field label="Support Email"><Input type="email" defaultValue="handout.corp@gmail.com"/></Field>
            <Field label="Platform Commission (%)"><Input type="number" defaultValue="10"/></Field>
            <Field label="Max Free Matches / Month"><Input type="number" defaultValue="5"/></Field>
          </div>
        </Card>
        <Card>
          <CardHeader title="Feature Flags"/>
          <div className="flex flex-col divide-y divide-[rgba(18,36,28,0.12)]">
            {[
              {l:"Email verification required",  on:true },
              {l:"Provider background checks",   on:true },
              {l:"Community forum enabled",      on:true },
              {l:"In-app payments",              on:false},
              {l:"AI roommate matching",         on:true },
              {l:"Maintenance mode",             on:false},
            ].map(({l,on})=>(
              <div key={l} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-[#12241C]">{l}</span>
                <Toggle defaultOn={on}/>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Email Templates"/>
          <div className="flex flex-col gap-2">
            {["Welcome email","Booking confirmation","New match alert","Password reset","Weekly digest"].map(t=>(
              <div key={t} className="flex items-center justify-between p-3 border border-[rgba(18,36,28,0.12)] rounded-xl">
                <span className="text-sm text-[#4c6157]">{t}</span>
                <span className="text-[11px] text-[#7d9188] font-semibold uppercase tracking-wide">Managed in Supabase</span>
              </div>
            ))}
          </div>
        </Card>
        <button onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}
          className={`w-full h-11 rounded-xl font-bold text-sm btn-press transition-all ${saved?"bg-[#12A150] text-white":"bg-[#12241C] text-white hover:opacity-90"}`}>
          {saved?"✓ Settings Saved!":"Save Settings"}
        </button>
      </div>
    </AdminLayout>
  );
}
