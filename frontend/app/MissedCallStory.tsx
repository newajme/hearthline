"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n } from "./lib/i18n";

type Scene = 0 | 1 | 2 | 3;

const SCENE_COUNT = 4;

export default function MissedCallStory() {
  const { t } = useI18n();
  const [active, setActive] = useState<Scene>(0);
  const beatRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number(visible.target.getAttribute("data-scene"));
        if (!Number.isNaN(idx)) setActive(idx as Scene);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    beatRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="story-wrap" id="story">
      <div className="shell story-head">
        <span className="section-flourish">{t("story.eyebrow")}</span>
        <h2 className="section-title">
          {t("story.title1")} <em className="hero-title-em">{t("story.title2")}</em>
        </h2>
        <p className="section-sub">{t("story.sub")}</p>
      </div>

      <div className="story-stage-wrap">
        <div className="shell story-stage-grid">
          <div className="story-beats">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                ref={(el) => { beatRefs.current[i] = el; }}
                data-scene={i}
                className={`story-beat ${active === i ? "is-active" : ""}`}
              >
                <span className="story-beat-num">0{i + 1}</span>
                <h3 className="story-beat-title">{t(`story.s${i + 1}.beat`)}</h3>
                <p className="story-beat-body">{t(`story.s${i + 1}.body`)}</p>
              </div>
            ))}
          </div>

          <div className="story-stage">
            <div className="story-stage-inner">
              <div className="story-rail" aria-hidden>
                {Array.from({ length: SCENE_COUNT }).map((_, i) => (
                  <span key={i} className={`story-rail-dot ${active >= i ? "is-on" : ""}`} />
                ))}
              </div>
              <div className="story-scenes">
                <SceneRing       active={active === 0} t={t} />
                <ScenePickup     active={active === 1} t={t} />
                <SceneSms        active={active === 2} t={t} />
                <SceneCalendar   active={active === 3} t={t} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SceneRing({ active, t }: { active: boolean; t: (k: string) => string }) {
  return (
    <div className={`scene scene-ring ${active ? "is-active" : ""}`}>
      <div className="scene-clock">11:47<span>pm</span></div>
      <div className="scene-phone">
        <div className="scene-phone-glow" />
        <svg viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 6h20v52H22z" />
          <circle cx="32" cy="50" r="2.5" />
          <path d="M22 14h20" />
        </svg>
        <span className="scene-ring-pulse" />
        <span className="scene-ring-pulse delay" />
      </div>
      <div className="scene-caption">{t("story.scene.incoming")}</div>
    </div>
  );
}

function ScenePickup({ active, t }: { active: boolean; t: (k: string) => string }) {
  return (
    <div className={`scene scene-pickup ${active ? "is-active" : ""}`}>
      <div className="scene-anna">
        <span className="scene-anna-avatar">A</span>
        <div>
          <strong>Anna</strong>
          <span className="scene-anna-status">
            <span className="scene-anna-dot" /> {t("story.scene.onLine")} · 00:08
          </span>
        </div>
      </div>
      <div className="scene-wave" aria-hidden>
        {Array.from({ length: 36 }).map((_, i) => (
          <span key={i} className="scene-wave-bar" style={{ animationDelay: `${i * 0.04}s` }} />
        ))}
      </div>
      <div className="scene-transcript">{t("story.scene.transcript")}</div>
    </div>
  );
}

function SceneSms({ active, t }: { active: boolean; t: (k: string) => string }) {
  return (
    <div className={`scene scene-sms ${active ? "is-active" : ""}`}>
      <div className="scene-sms-thread">
        <div className="scene-sms-msg in">
          <div className="scene-sms-bubble">{t("convo.msg1")}</div>
        </div>
        <div className="scene-sms-msg out">
          <div className="scene-sms-bubble">{t("convo.msg2")}</div>
        </div>
        <div className="scene-sms-msg in">
          <div className="scene-sms-bubble">{t("convo.msg3")}</div>
        </div>
        <div className="scene-sms-msg out">
          <div className="scene-sms-bubble">
            {t("convo.msg4Pre")}<strong>$3,540</strong>{t("convo.msg4Mid")}
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneCalendar({ active, t }: { active: boolean; t: (k: string) => string }) {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <div className={`scene scene-calendar ${active ? "is-active" : ""}`}>
      <div className="scene-cal-head">
        <span>{t("story.scene.calHead")}</span>
        <strong>{t("story.scene.calNew")}</strong>
      </div>
      <div className="scene-cal-grid">
        {DAYS.map((d, di) => (
          <div key={d} className="scene-cal-col">
            <div className="scene-cal-day">{d}</div>
            {di === 1 && (
              <div className="scene-cal-slot is-new">
                <span className="scene-cal-time">9:30 AM</span>
                <span className="scene-cal-job">{t("story.scene.cal.survey")}</span>
                <span className="scene-cal-tag">{t("story.scene.cal.tagNew")}</span>
              </div>
            )}
            {di === 2 && (
              <div className="scene-cal-slot">
                <span className="scene-cal-time">2:00 PM</span>
                <span className="scene-cal-job">{t("story.scene.cal.hvac")}</span>
              </div>
            )}
            {di === 4 && (
              <div className="scene-cal-slot is-new">
                <span className="scene-cal-time">11:00 AM</span>
                <span className="scene-cal-job">{t("story.scene.cal.roof")}</span>
                <span className="scene-cal-tag">{t("story.scene.cal.tagNew")}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="scene-cal-foot">
        <span>{t("story.s4.foot")}</span>
      </div>
    </div>
  );
}
