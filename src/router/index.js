import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const RouterContext = createContext({ pathname: '/', navigate: () => {} });
const ParamsContext = createContext({});

function getWindowPathname() {
  if (typeof window === 'undefined') {
    return '/';
  }
  return window.location.pathname || '/';
}

function navigateHistory(to, { replace = false } = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  if (replace) {
    window.history.replaceState({}, '', to);
  } else {
    window.history.pushState({}, '', to);
  }
}

export function Router({ children }) {
  const [pathname, setPathname] = useState(getWindowPathname);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handlePopState = () => {
      setPathname(getWindowPathname());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to, options) => {
    navigateHistory(to, options);
    setPathname(to);
  };

  const value = useMemo(() => ({ pathname, navigate }), [pathname]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function MemoryRouter({ children, initialPath = '/' }) {
  const [pathname, setPathname] = useState(initialPath);

  const navigate = (to, { replace = false } = {}) => {
    setPathname(to);
  };

  const value = useMemo(() => ({ pathname, navigate }), [pathname]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function matchPath(pattern, pathname) {
  if (!pattern) {
    return { match: false, params: {} };
  }

  if (pattern === '*') {
    return { match: true, params: {} };
  }

  const normalise = (value) => value.replace(/\/+$/, '').replace(/^\/+/, '');
  const patternSegments = normalise(pattern).split('/').filter(Boolean);
  const pathSegments = normalise(pathname).split('/').filter(Boolean);

  if (patternSegments.length !== pathSegments.length) {
    return { match: false, params: {} };
  }

  const params = {};

  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index];
    const pathSegment = pathSegments[index];

    if (patternSegment.startsWith(':')) {
      const key = patternSegment.slice(1);
      params[key] = decodeURIComponent(pathSegment);
      continue;
    }

    if (patternSegment !== pathSegment) {
      return { match: false, params: {} };
    }
  }

  return { match: true, params };
}

export function Routes({ children }) {
  const { pathname } = useContext(RouterContext);
  let matchElement = null;
  let matchParams = {};

  const childArray = Array.isArray(children) ? children : [children];

  for (const child of childArray) {
    if (!child || typeof child !== 'object') {
      continue;
    }

    const { path, element } = child.props ?? {};
    const { match, params } = matchPath(path, pathname);

    if (match) {
      matchElement = element;
      matchParams = params;
      break;
    }
  }

  if (!matchElement) {
    return null;
  }

  return <ParamsContext.Provider value={matchParams}>{matchElement}</ParamsContext.Provider>;
}

export function Route() {
  return null;
}

export function useRouter() {
  return useContext(RouterContext);
}

export function useRouteParams() {
  return useContext(ParamsContext);
}

export function Link({ to, replace = false, onClick, children, ...rest }) {
  const { navigate, pathname } = useRouter();

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }

    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (to !== pathname) {
      navigate(to, { replace });
    }
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

export function NavLink({ to, className, children, exact = false, ...rest }) {
  const { pathname } = useRouter();

  const normalise = (value) => {
    if (!value) {
      return '/';
    }
    const trimmed = value.replace(/\/+$/, '');
    return trimmed === '' ? '/' : trimmed;
  };

  const current = normalise(pathname);
  const target = normalise(to);

  const isExactMatch = current === target;
  const isPartialMatch = target !== '/' && current.startsWith(`${target}/`);
  const isActive = exact ? isExactMatch : isExactMatch || isPartialMatch;

  const computedClassName =
    typeof className === 'function' ? className({ isActive }) : className;

  const childContent =
    typeof children === 'function' ? children({ isActive }) : children;

  return (
    <Link to={to} className={computedClassName} {...rest}>
      {childContent}
    </Link>
  );
}
