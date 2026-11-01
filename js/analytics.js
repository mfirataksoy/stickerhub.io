// PostHog analytics for the StickerHub archive. Hand-written and loaded from
// index.html next to the compiled Vue bundle (which we can't rebuild here), so
// named events come from document-level click delegation instead of the app code.
(function () {
  // Public project key (safe to ship in the bundle); same PostHog project as mfirataksoy.com.
  var POSTHOG_TOKEN = 'phc_zz3FEQ6NNTeNJcS9WKTRDSnQod3FYjuXsJ7EPd77Cozq';
  var POSTHOG_HOST = 'https://us.i.posthog.com';

  // Visiting any page with ?notrack turns analytics off in that browser for good
  // (for my own visits); ?track turns it back on.
  var OPT_OUT_KEY = 'mfa-notrack';

  function optedOut() {
    try {
      var params = new URLSearchParams(location.search);
      if (params.has('notrack')) localStorage.setItem(OPT_OUT_KEY, '1');
      if (params.has('track')) localStorage.removeItem(OPT_OUT_KEY);
      return localStorage.getItem(OPT_OUT_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  // Only the deployed site reports, so local visits stay out of the data.
  var host = location.hostname;
  var dev = host === 'localhost' || host === '127.0.0.1' || /\.local$/.test(host);
  var analyticsEnabled = !dev && !optedOut();

  function capture(event, props) {
    if (dev) console.debug('[analytics]', event, props);
    if (!analyticsEnabled) return;
    window.posthog.capture(event, props);
  }

  if (analyticsEnabled) {
    // Official PostHog HTML snippet: queues calls until array.js arrives from us-assets.i.posthog.com.
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    window.posthog.init(POSTHOG_TOKEN, {
      api_host: POSTHOG_HOST,
      // SPA pageviews on history changes (Vue Router history mode) and autocapture.
      defaults: '2026-01-30',
      // No cookies; returning visitors are recognised through localStorage.
      persistence: 'localStorage',
    });
    window.posthog.register({ site: 'StickerHub' });
  }

  // Where on the page a click happened, for CTAs that appear in several places.
  function where(el) {
    if (/\bwarning--text\b/.test(el.className)) return 'home_categories'; // "Show more"
    if (el.closest('.archive-bar')) return 'archive_bar';
    if (el.closest('#mainNav')) return 'nav';
    if (el.closest('.masthead')) return 'hero';
    if (el.closest('#farewell')) return 'farewell';
    if (el.closest('#features')) return 'features';
    if (el.closest('#about')) return 'footer';
    return 'page';
  }

  // Category slug from a /category/<name> path, e.g. on the sticker page.
  function categoryFromPath() {
    var m = location.pathname.match(/^\/category\/([^/]+)/);
    return m ? decodeURIComponent(m[1]) : undefined;
  }

  // Capture phase, so it runs before Vue's handlers re-render or navigate.
  function onClick(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    // Leave the AI chat widget to its own analytics.
    if (t.closest('#firat-chat')) return;

    // Language switch (TR/EN); aria-pressed still holds the old state here.
    var lang = t.closest('.lang-switch__option');
    if (lang) {
      if (lang.getAttribute('aria-pressed') !== 'true') {
        capture('language_switched', { locale: lang.getAttribute('lang') });
      }
      return;
    }

    // Sticker "Get" button: opens the mock chat that replays the retired bot.
    if (t.closest('.v-card__title .v-btn')) {
      capture('sticker_get_clicked', { category: categoryFromPath() });
      return;
    }

    // Category card (home and /categories); its title is the category slug.
    var card = t.closest('.v-card--link');
    if (card) {
      var title = card.querySelector('.v-card__title');
      if (title) {
        capture('category_opened', {
          category: title.textContent.trim().slice(0, 50),
          from: location.pathname === '/' ? 'home' : 'categories',
        });
      }
      return;
    }

    var link = t.closest('a[href]');
    var href = link ? link.getAttribute('href') : '';
    var button = t.closest('button, .v-btn');

    // "See stickers" / "Browse the stickers" / "Show more" and the nav link.
    if (/^\/categories\/?$/.test(href) ||
        (button && button.closest('.masthead') && !button.querySelector('.fa-heart, [data-icon="heart"]')) ||
        (button && /\bwarning--text\b/.test(button.className))) {
      capture('stickers_browse_clicked', { where: where(link || button) });
      return;
    }

    // "Read the farewell" from the archive bar, nav or hero.
    if (/#farewell$/.test(href) || (button && button.closest('.masthead'))) {
      capture('farewell_read_clicked', { where: where(link || button) });
      return;
    }

    // Outbound links: the mfirataksoy.com credit and the GitHub links.
    if (link && link.host && link.host !== location.host) {
      capture('outbound_link_clicked', { url: link.href.slice(0, 200), where: where(link) });
    }
  }

  document.addEventListener('click', onClick, true);
})();
