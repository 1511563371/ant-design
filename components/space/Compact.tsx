import classNames from 'classnames';
import toArray from 'rc-util/lib/Children/toArray';
import * as React from 'react';

import type { DirectionType } from '../config-provider';
import { ConfigContext } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';

import useStyle from './style';

export interface SpaceCompactItemContextType {
  compactSize?: SizeType;
  compactDirection?: 'horizontal' | 'vertical';
  isFirstItem?: boolean;
  isLastItem?: boolean;
}

export const SpaceCompactItemContext = React.createContext<SpaceCompactItemContextType | null>(
  null,
);

export const useCompactItemContext = (prefixCls: string, direction: DirectionType) => {
  const compactItemContext = React.useContext(SpaceCompactItemContext);

  const compactItemClassnames = React.useMemo(() => {
    if (!compactItemContext) return '';

    const { compactDirection, isFirstItem, isLastItem } = compactItemContext;
    const separator = compactDirection === 'vertical' ? '-vertical-' : '-';

    return classNames({
      [`${prefixCls}-compact${separator}item`]: true,
      [`${prefixCls}-compact${separator}first-item`]: isFirstItem,
      [`${prefixCls}-compact${separator}last-item`]: isLastItem,
      [`${prefixCls}-compact${separator}item-rtl`]: direction === 'rtl',
    });
  }, [prefixCls, direction, compactItemContext]);

  return {
    compactSize: compactItemContext?.compactSize,
    compactDirection: compactItemContext?.compactDirection,
    compactItemClassnames,
  };
};

export const NoCompactStyle: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <SpaceCompactItemContext.Provider value={null}>{children}</SpaceCompactItemContext.Provider>
);

export interface SpaceCompactProps extends React.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string;
  size?: SizeType;
  direction?: 'horizontal' | 'vertical';
  block?: boolean;
}

const CompactItem: React.FC<React.PropsWithChildren<SpaceCompactItemContextType>> = ({
  children,
  ...otherProps
}) => (
  <SpaceCompactItemContext.Provider value={otherProps}>{children}</SpaceCompactItemContext.Provider>
);

const Compact: React.FC<SpaceCompactProps> = props => {
  const { getPrefixCls, direction: directionConfig } = React.useContext(ConfigContext);

  const {
    size = 'middle',
    direction,
    block,
    prefixCls: customizePrefixCls,
    className,
    children,
    ...restProps
  } = props;

  const prefixCls = getPrefixCls('space-compact', customizePrefixCls);
  const [wrapSSR, hashId] = useStyle(prefixCls);
  const clx = classNames(
    prefixCls,
    hashId,
    {
      [`${prefixCls}-rtl`]: directionConfig === 'rtl',
      [`${prefixCls}-block`]: block,
      [`${prefixCls}-vertical`]: direction === 'vertical',
    },
    className,
  );

  const compactItemContext = React.useContext(SpaceCompactItemContext);

  const childNodes = toArray(children);
  const nodes = React.useMemo(
    () =>
      childNodes.map((child, i) => {
        const key = (child && child.key) || `${prefixCls}-item-${i}`;

        return (
          <CompactItem
            key={key}
            compactSize={size}
            compactDirection={direction}
            isFirstItem={i === 0 && (!compactItemContext || compactItemContext?.isFirstItem)}
            isLastItem={
              i === childNodes.length - 1 && (!compactItemContext || compactItemContext?.isLastItem)
            }
          >
            {child}
          </CompactItem>
        );
      }),
    [size, childNodes, compactItemContext],
  );

  // =========================== Render ===========================
  if (childNodes.length === 0) {
    return null;
  }

  return wrapSSR(
    <div className={clx} {...restProps}>
      {nodes}
    </div>,
  );
};

export default Compact;
