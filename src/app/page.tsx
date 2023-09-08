
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
       <div className={styles.inputContainer}>
          <input type="text" id="myInput" placeholder="Digite algo aqui..." />
          <button id="myButton">Enviar</button>
        </div>
    </main>
  )
}
