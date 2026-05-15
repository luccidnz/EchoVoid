# Animation Guidelines

This project uses [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) for subtle motion and navigation effects.

## Stack Transitions
- Custom fade transitions are defined in `src/navigation/AppNavigator.tsx`.
- Adjust `fadeConfig` and the `forFade` interpolator to tweak timing or style.

## Component Interactions
- `EVoidButton` and `EVoidToggle` scale slightly on press and hover.
- Keep interaction animations under 200ms to preserve responsiveness.

## Screen Transitions
- Screens such as `HomeScreen` and `TransmissionScreen` use `entering`/`exiting` props for page-level fades or slides.
- Wrap the root layout in an `Animated` component and choose an appropriate preset (`FadeIn`, `FadeOut`, etc.).

## Best Practices
- Prefer `withTiming` for simple transitions; `withSpring` for elastic effects.
- Favor subtle motion to maintain the app's atmosphere and performance.
