import '@/styles/globals.css'
import { GlobalCanvas } from '@14islands/r3f-scroll-rig'
export default function App({ Component, pageProps }) {
	return (
		<>
			<GlobalCanvas />
			<Component {...pageProps} />
		</>
	)
}
