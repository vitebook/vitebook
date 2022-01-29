<script>
  import { homePageConfig } from './homePageConfig';

  $: hasFeatures = ($homePageConfig?.features?.length ?? 0) > 0;
  $: features = $homePageConfig?.features ?? [];

  // Strange but we need static import paths so Vite can analyze and bundle icons.
  function getIcons(features) {
    if (features.length === 0) return [];
    return [
      async () =>
        features.length > 0 &&
        (await import(':virtual/vitebook/icons/home-feature-0?raw')),
      async () =>
        features.length > 1 &&
        (await import(':virtual/vitebook/icons/home-feature-0?raw')),
      async () =>
        features.length > 2 &&
        (await import(':virtual/vitebook/icons/home-feature-0?raw')),
      async () =>
        features.length > 3 &&
        (await import(':virtual/vitebook/icons/home-feature-3?raw')),
      async () =>
        features.length > 4 &&
        (await import(':virtual/vitebook/icons/home-feature-4?raw')),
      async () =>
        features.length > 5 &&
        (await import(':virtual/vitebook/icons/home-feature-5?raw')),
    ];
  }

  $: icons = getIcons(features);
</script>

{#if hasFeatures}
  <div class="home__features">
    <div class="home__features__container">
      {#each features as feature, i (feature)}
        <section class="home__feature with-icon">
          <div>
            {#if feature.title}
              <h2 class="home__feature__title">
                {#if icons[i]}
                  <div class="home__feature__icon">
                    {#await icons[i]() then icon}
                      {@html icon ? icon.default : ''}
                    {/await}
                  </div>
                {/if}
                {feature.title}
              </h2>
            {/if}

            {#if feature.body}
              <p class="home__feature__body">
                {feature.body}
              </p>
            {/if}
          </div>
        </section>
      {/each}
    </div>
  </div>
{/if}

<style>
  .home__features {
    margin: 0 auto;
    max-width: 960px;
    margin-top: 3.5rem;
    padding: 0 1rem;
  }

  .home__features__container {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: stretch;
    justify-content: space-between;
    padding-left: 2rem;
    padding-right: 1rem;
  }

  .home__feature {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-grow: 1;
    flex-basis: 100%;
    max-width: 100%;
    text-align: left;
    margin-top: 2.5rem;
  }

  .home__feature:first-child {
    margin-top: 0;
  }

  .home__feature__title {
    display: flex;
    align-items: center;
    border-bottom: 0;
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0;
    padding: 0;
  }

  .home__feature__icon {
    font-size: 1.25rem;
    margin-right: 0.5rem;
  }

  .home__feature__body {
    font-size: 0.9rem;
    margin: 0;
    margin-top: 0.5rem;
  }

  @media (min-width: 576px) {
    .home__features {
      padding-left: 2.5rem;
      max-width: 760px;
    }

    .home__features__container {
      padding-left: 0;
      padding-right: 0;
    }

    .home__feature {
      flex-basis: 48%;
      max-width: 48%;
    }

    .home__feature:first-child .home__feature__title {
      margin-top: 2.25rem;
    }
  }

  @media (min-width: 992px) {
    .home__features {
      padding-left: 4rem;
      max-width: 960px;
    }

    .home__feature {
      flex-basis: 30%;
      max-width: 30%;
    }
  }
</style>
