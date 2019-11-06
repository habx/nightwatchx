export const classSelector = (className: string, element: string = 'div') =>
  `${element}[class*="${className}"]`
export const selector = (testId: string, element = '*') =>
  `${element}[data-testid="${testId}"]`
