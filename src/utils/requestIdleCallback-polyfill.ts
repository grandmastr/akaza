const ric =
  (window as any).requestIdleCallback ||
  ((cb: any) => setTimeout(() => cb({ timeRemaining: () => 50 }), 0));

export default ric;
