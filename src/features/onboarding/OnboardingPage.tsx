import { useState } from 'react';
import type { MemberProfile } from '../../services/memberStore';
import { updateProfile } from '../../services/memberStore';
import './onboarding.css';

const interestsList = ['Golden hour', 'Storms', 'Night sky', 'Clouds'];
export function OnboardingPage({ profile, onComplete }: { profile: MemberProfile; onComplete: () => void; }) {
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState(profile.interests ?? []);
  const [homeLocation, setHomeLocation] = useState(profile.homeLocation ?? '');
  const finish = (followStarter: boolean) => {
    updateProfile({ interests, homeLocation: homeLocation.trim(), onboardingComplete: true, starterCollectionFollowed: followStarter });
    onComplete();
  };
  if (profile.onboardingComplete) return <section className="onboarding"><p className="eyebrow">WELCOME TO AERIS</p><h2>Your sky journal is ready.</h2><button onClick={onComplete}>Continue to your journal</button></section>;
  return <section className="onboarding" aria-labelledby="onboarding-title"><p className="eyebrow">AERIS / YOUR FIRST VISIT · STEP {step} OF 3</p><h2 id="onboarding-title">{step===1?'What do you love to photograph?':step===2?'Where do you look up?':'A collection to start with'}</h2>
    {step===1&&<><p>Choose a few interests to shape your journal. You can change them later.</p><fieldset><legend>Your sky interests</legend>{interestsList.map((interest) => <label key={interest}><input type="checkbox" checked={interests.includes(interest)} onChange={(event) => setInterests((current) => event.target.checked ? [...current, interest] : current.filter((item) => item!==interest))} />{interest}</label>)}</fieldset><button onClick={() => setStep(2)}>Continue</button></>}
    {step===2&&<><p>Add a home city if you like. The Planner will use it as a starting point; you can still choose another place anytime.</p><label className="onboarding__location">Home location <input value={homeLocation} onChange={(event) => setHomeLocation(event.target.value)} placeholder="City, country (optional)" maxLength={120} /></label><div className="onboarding__actions"><button onClick={() => setStep(3)}>Continue</button><button className="onboarding__quiet" onClick={() => { setHomeLocation(''); setStep(3); }}>Skip location</button></div></>}
    {step===3&&<><p>Follow the starter collection “First Light” for a small set of photographs shaped by the first and last light of day.</p><article className="onboarding__starter"><span>STARTER COLLECTION</span><h3>First Light</h3><p>Golden hour, open horizons and changing skies.</p></article><div className="onboarding__actions"><button onClick={() => finish(true)}>Follow First Light & finish</button><button className="onboarding__quiet" onClick={() => finish(false)}>Finish without following</button></div></>}
    <button className="onboarding__skip" onClick={() => finish(false)}>Skip setup</button>
  </section>;
}
