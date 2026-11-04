export interface ViewportRect {
  left: number
  top: number
  width: number
  height: number
}

export interface ExperienceState {
  heroProgress: number
  flightProgress: number
  visible: boolean
  rangerAmount?: number
  heroTarget?: ViewportRect
  projectTarget?: ViewportRect
}

export interface ExperienceOptions {
  portraitUrl: string
  projectUrl: string
  rangerEnabled?: boolean
  rangerPortraitUrl?: string
  onReady?: () => void
  onError?: (error: unknown) => void
}

export interface ExperienceController {
  update(state: ExperienceState): void
  resize(): void
  dispose(): void
}
