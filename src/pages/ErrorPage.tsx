import { Link, useRouteError } from "react-router";
import { ROUTES } from "../config/links";

export default function ErrorPage() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : "Unknown error";

  return (
    <div className="page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{message}</i>
      </p>
      <Link to={ROUTES.home}>Back to Home</Link>
    </div>
  );
}
