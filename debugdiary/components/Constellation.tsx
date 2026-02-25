'use client'
import { useEffect, useRef } from 'react'

export default function Constellation() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!

        let W = canvas.width = window.innerWidth
        let H = canvas.height = window.innerHeight

        window.addEventListener('resize', () => {
            W = canvas.width = window.innerWidth
            H = canvas.height = window.innerHeight
        })

        let mouse = {
            x: null as number | null,
            y: null as number | null
        }

        document.addEventListener('mousemove', e => {
            mouse.x = e.clientX
            mouse.y = e.clientY
        })

        const isMob = window.innerWidth < 768
        const PC = isMob ? 50 : 110
        const MD = isMob ? 80 : 125
        const MSD = 175

        class Particle {
            x: number; y: number
            vx: number; vy: number
            ph: number; ws: number; wa: number
            bs: number; s: number
            bo: number; o: number
            ops: number; opsp: number
            star: boolean

            constructor() {
                this.x = Math.random() * W
                this.y = Math.random() * H
                this.vx = (Math.random() - 0.5) * 0.25
                this.vy = (Math.random() - 0.5) * 0.25
                this.ph = Math.random() * Math.PI * 2
                this.ws = 0.006 + Math.random() * 0.005
                this.wa = 0.3 + Math.random() * 0.28
                this.bs = 0.6 + Math.random() * 1.5
                this.s = this.bs
                this.bo = 0.2 + Math.random() * 0.5
                this.o = this.bo
                this.ops = Math.random() * Math.PI * 2
                this.opsp = 0.008 + Math.random() * 0.012
                this.star = Math.random() < 0.12
                if (this.star) {
                    this.bs = 1.3 + Math.random() * 2
                    this.bo = 0.6 + Math.random() * 0.4
                }
            }

            update(t: number) {
                this.vx += Math.sin(t * this.ws + this.ph) * this.wa * 0.009
                this.vy += Math.cos(t * this.ws + this.ph) * this.wa * 0.009
                this.vx *= 0.992
                this.vy *= 0.992

                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x
                    const dy = this.y - mouse.y
                    const d = Math.sqrt(dx * dx + dy * dy)
                    if (d < 120 && d > 0) {
                        const f = (120 - d) / 120
                        this.vx += (dx / d) * f * 0.8
                        this.vy += (dy / d) * f * 0.8
                    }
                }

                this.x += this.vx
                this.y += this.vy
                if (this.x < -8) this.x = W + 8
                if (this.x > W + 8) this.x = -8
                if (this.y < -8) this.y = H + 8
                if (this.y > H + 8) this.y = -8

                this.o = this.bo + Math.sin(t * this.opsp + this.ops) * 0.16
                if (this.star) {
                    this.s = this.bs + Math.sin(t * this.opsp * 0.7) * 0.5
                }
            }

            draw() {
                if (!ctx) return
                ctx.save()
                if (this.star) {
                    ctx.shadowBlur = 12
                    ctx.shadowColor = 'rgba(255,255,255,.9)'
                }
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255,255,255,${this.o})`
                ctx.fill()
                ctx.restore()
            }
        }

        const particles: Particle[] = Array.from({ length: PC }, () => new Particle())

        let t = 0
        let animId: number

        function draw() {
            animId = requestAnimationFrame(draw)
            t++
            ctx.fillStyle = 'rgba(4,6,8,.16)'
            ctx.fillRect(0, 0, W, H)

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const d = Math.sqrt(dx * dx + dy * dy)
                    if (d < MD) {
                        const op = (1 - d / MD) * 0.2
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.strokeStyle = `rgba(200,220,255,${op})`
                        ctx.lineWidth = 0.45
                        ctx.stroke()
                    }
                }
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = particles[i].x - mouse.x
                    const dy = particles[i].y - mouse.y
                    const d = Math.sqrt(dx * dx + dy * dy)
                    if (d < MSD) {
                        const op = (1 - d / MSD) * 0.5
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(mouse.x, mouse.y)
                        ctx.strokeStyle = `rgba(255,255,255,${op})`
                        ctx.lineWidth = 0.8
                        ctx.stroke()
                    }
                }
                particles[i].update(t)
                particles[i].draw()
            }

            const bx = W * 0.65 + Math.sin(t * 0.003) * W * 0.1
            const by = H * 0.25 + Math.cos(t * 0.002) * H * 0.08
            const b1 = ctx.createRadialGradient(bx, by, 0, bx, by, W * 0.38)
            b1.addColorStop(0, 'rgba(59,130,246,.065)')
            b1.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = b1
            ctx.fillRect(0, 0, W, H)
        }

        draw()

        return () => {
            cancelAnimationFrame(animId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-0"
        />
    )
}
