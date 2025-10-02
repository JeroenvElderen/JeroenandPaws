export function ErrorState({ message = 'Something went wrong while loading this section.' }) {
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
    </div>
  );
}
