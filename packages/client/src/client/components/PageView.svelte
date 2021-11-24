<script>
  import App from ':virtual/vitebook/client/app';
  import { currentRoute } from '../stores/currentRoute';
</script>

<App component={$currentRoute?.component} />
