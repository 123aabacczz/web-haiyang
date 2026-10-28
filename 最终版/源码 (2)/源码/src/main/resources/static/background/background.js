class GalaxyOceanEffect {
    constructor() {
        this.galaxyCanvas = document.getElementById('galaxy-canvas');
        this.oceanCanvas = document.getElementById('ocean-canvas');

        if (!this.galaxyCanvas || !this.oceanCanvas) {
            this.createCanvasElements();
        }

        this.galaxyCtx = this.galaxyCanvas.getContext('2d');
        this.oceanCtx = this.oceanCanvas.getContext('2d');

        // 特效系统
        this.beams = [];
        this.seabedRipples = [];
        this.initBeams();

        // 优化参数
        this.beamCount = 8;
        this.seabedRippleFrequency = 0.10;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // 主题控制
        this.galaxyThemes = [
            {
                bg: ['#1a0633', '#0c0021'],
                particles: ['#9b5de5', '#a06cd5', '#da70d6', '#c77dff']
            },
            {
                bg: ['#0c0e2b', '#000022'],
                particles: ['#5a189a', '#7b68ee', '#e6e6fa', '#b388eb']
            }
        ];
        this.currentTheme = 0;

        // 粒子系统
        this.particles = [];
        this.initParticles(150); // 增加默认粒子数量

        // 特效系统
        this.bubbles = [];
        this.ripples = [];
        this.nebulas = [];
        this.initNebulas();

        // 鼠标位置
        this.mouseX = -1000;
        this.mouseY = -1000;

        // 控制参数
        this.particleDensity = 150;
        this.bubbleFrequency = 3;

        // 事件监听
        this.setupEventListeners();

        // 开始动画
        this.animate();

        // 创建水平光晕
        this.createHorizonGlow();
    }

    createHorizonGlow() {
        const glow = document.createElement('div');
        glow.className = 'horizon-glow';
        document.getElementById('background-container').appendChild(glow);
    }

    createCanvasElements() {
        const container = document.getElementById('background-container');

        this.galaxyCanvas = document.createElement('canvas');
        this.galaxyCanvas.id = 'galaxy-canvas';
        container.appendChild(this.galaxyCanvas);

        this.oceanCanvas = document.createElement('canvas');
        this.oceanCanvas.id = 'ocean-canvas';
        container.appendChild(this.oceanCanvas);
    }

    resizeCanvas() {
        this.galaxyCanvas.width = window.innerWidth;
        this.galaxyCanvas.height = window.innerHeight * 0.5;
        this.oceanCanvas.width = window.innerWidth;
        this.oceanCanvas.height = window.innerHeight * 0.5;
    }

    initParticles(count) {
            this.particles = [];
            const colors = this.galaxyThemes[this.currentTheme].particles;

            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.galaxyCanvas.width,
                    y: Math.random() * this.galaxyCanvas.height,
                    size: Math.random() * 1.5 + 3.0,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    glow: Math.random() * 0.7 + 0.3,
                    // 添加旋转中心属性（随机分布在画布上）
                    rotationCenterX: Math.random() * this.galaxyCanvas.width,
                    rotationCenterY: Math.random() * this.galaxyCanvas.height * 0.7,
                    // 添加旋转速度属性
                    rotationSpeed: (Math.random() - 0.5) * 0.03,
                    // 添加旋转半径属性
                    rotationRadius: 30 + Math.random() * 150
                });
            }
        }

    initNebulas() {
        this.nebulas = [];
        for (let i = 0; i < 6; i++) { // 增加星云数量
            const hue = 270 + Math.random() * 40; // 扩大星云色调范围
            this.nebulas.push({
                x: Math.random() * this.galaxyCanvas.width,
                y: Math.random() * this.galaxyCanvas.height * 0.8,
                radius: 120 + Math.random() * 180, // 增加星云大小
                color: `hsla(${hue}, 75%, 50%, ${0.15 + Math.random() * 0.15})` // 提高透明度
            });
        }
    }

    createBubble() {
        const size = 8 + Math.random() * 18; // 减小气泡大小范围
        return {
            x: Math.random() * this.oceanCanvas.width,
            y: this.oceanCanvas.height + size,
            size,
            speed: 0.7 + Math.random() * 1.3, // 降低气泡速度
            color: `hsla(${180 + Math.random() * 40}, 85%, 90%, 0.7)`, // 提高亮度和饱和度
            glowColor: `hsla(${190 + Math.random() * 20}, 100%, 95%, 0.5)`,
            life: 140 // 增加气泡生命周期
        };
    }

    // 优化涟漪生成位置和参数
     createRipple(x, y) {
            // 增加更多涟漪形状
            const shapes = ['circle', 'ellipse', 'polygon', 'square', 'triangle', 'star'];
            return {
                x,
                y,
                radius: 12 + Math.random() * 8,
                maxRadius: 250 + Math.random() * 350,
                alpha: 1.2 + Math.random() * 0.6,
                waveCount: 4 + Math.floor(Math.random() * 6),
                // 减少涟漪生命周期（从140+40改为80+40）
                life: 80 + Math.random() * 40,
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                rotation: Math.random() * Math.PI * 2,
                color: `hsla(${170 + Math.random() * 50}, 85%, 92%, 0.8)`
            };
     }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            if (e.clientY > this.galaxyCanvas.height) {
                this.ripples.push(this.createRipple(e.clientX, e.clientY));
            }
        });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;

            if (touch.clientY > this.galaxyCanvas.height) {
                this.ripples.push(this.createRipple(touch.clientX, touch.clientY));
            }
        }, { passive: false });

        // 控制面板事件
        document.getElementById('particle-density').addEventListener('input', (e) => {
            this.particleDensity = parseInt(e.target.value);
            document.getElementById('particle-density-value').textContent = this.particleDensity;
            this.initParticles(this.particleDensity);
        });

        document.getElementById('bubble-frequency').addEventListener('input', (e) => {
            this.bubbleFrequency = parseInt(e.target.value);
            document.getElementById('bubble-frequency-value').textContent = this.bubbleFrequency;
        });

        document.getElementById('beam-count').addEventListener('input', (e) => {
            this.beamCount = parseInt(e.target.value);
            document.getElementById('beam-count-value').textContent = this.beamCount;
            this.initBeams();
        });

        document.getElementById('seabed-ripple-frequency').addEventListener('input', (e) => {
            this.seabedRippleFrequency = parseFloat(e.target.value);
            document.getElementById('seabed-ripple-frequency-value').textContent =
                this.seabedRippleFrequency.toFixed(2);
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.currentTheme = (this.currentTheme + 1) % this.galaxyThemes.length;
            this.initParticles(this.particles.length);
            this.initNebulas();
        });
    }

    // 光束效果优化
    initBeams() {
            this.beams = [];
            for (let i = 0; i < this.beamCount; i++) {
                // 修正光束初始位置（确保在可视区域内）
                this.beams.push({
                    x: Math.random() * this.oceanCanvas.width,
                    // 修正：初始y位置在海洋区域内（从底部向上20%-60%区域）
                    y: this.oceanCanvas.height * 0.6 + Math.random() * this.oceanCanvas.height * 0.3,
                    speedX: (Math.random() - 0.5) * 1.2,
                    speedY: -1.5 - Math.random() * 1.8,
                    length: 60 + Math.random() * 80,
                    size: 1.2 + Math.random() * 2.0,
                    alpha: 0.85 + Math.random() * 0.15,
                    blinkTimer: Math.random() * 100,
                    color: `hsla(${170 + Math.random() * 70}, 100%, 88%, 0.9)`,
                    trailParticles: []
                });
            }
    }

    updateBeams() {
        this.beams.forEach(beam => {
            beam.x += beam.speedX;
            beam.y += beam.speedY;

            beam.blinkTimer += 0.04; // 降低闪烁速度
            beam.alpha = 0.8 + Math.sin(beam.blinkTimer) * 0.2;

            // 添加更多拖尾粒子
            if (Math.random() < 0.5) { // 降低拖尾粒子频率
                beam.trailParticles.push({
                    x: beam.x,
                    y: beam.y,
                    size: Math.random() * 1.5 + 0.6, // 减小粒子大小
                    alpha: 1.0,
                    life: 50 // 增加生命周期
                });
            }

            // 绘制流星
            this.oceanCtx.save();
            this.oceanCtx.beginPath();

            const gradient = this.oceanCtx.createLinearGradient(
                beam.x, beam.y,
                beam.x - beam.speedX * beam.length/2,
                beam.y - beam.speedY * beam.length/2
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${beam.alpha})`);
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

            this.oceanCtx.strokeStyle = gradient;
            this.oceanCtx.lineWidth = beam.size;
            this.oceanCtx.lineCap = 'round';

            this.oceanCtx.moveTo(beam.x, beam.y);
            this.oceanCtx.lineTo(
                beam.x - beam.speedX * beam.length/2,
                beam.y - beam.speedY * beam.length/2
            );
            this.oceanCtx.stroke();

            // 增大流星头部光点
            this.oceanCtx.beginPath();
            this.oceanCtx.arc(beam.x, beam.y, beam.size * 2.0, 0, Math.PI * 2); // 减小头部光点大小
            this.oceanCtx.fillStyle = `rgba(255, 255, 255, ${beam.alpha})`;
            this.oceanCtx.fill();

            this.oceanCtx.restore();

            // 更新拖尾粒子
            for (let i = beam.trailParticles.length - 1; i >= 0; i--) {
                const particle = beam.trailParticles[i];
                particle.alpha -= 0.02; // 降低消失速度
                particle.life -= 0.8; // 降低生命周期减少速度

                if (particle.alpha > 0 && particle.life > 0) {
                    this.oceanCtx.beginPath();
                    this.oceanCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.oceanCtx.fillStyle = `rgba(210, 240, 255, ${particle.alpha})`; // 调整颜色
                    this.oceanCtx.fill();
                } else {
                    beam.trailParticles.splice(i, 1);
                }
            }

            // 重置移出屏幕的流星
            if (beam.y < -100 || beam.x < -100 || beam.x > this.oceanCanvas.width + 100) {
                beam.x = Math.random() * this.oceanCanvas.width;
                beam.y = this.oceanCanvas.height + 30 + Math.random() * 70;
                beam.trailParticles = [];
            }
        });
    }

    // 优化海底涟漪位置和参数
    createSeabedRipple() {
        return {
            x: Math.random() * this.oceanCanvas.width,
            y: this.oceanCanvas.height - 10 - Math.random() * 15, // 增加垂直位置随机性
            radius: 10 + Math.random() * 15, // 增加初始半径随机性
            maxRadius: 120 + Math.random() * 180, // 扩大最大半径范围
            alpha: 0.85 + Math.random() * 0.15, // 增加透明度随机性
            life: 140 + Math.random() * 40 // 增加生命周期随机性
        };
    }

    animate() {
        this.galaxyCtx.clearRect(0, 0, this.galaxyCanvas.width, this.galaxyCanvas.height);
        this.oceanCtx.clearRect(0, 0, this.oceanCanvas.width, this.oceanCanvas.height);

        this.drawBackgrounds();
        this.drawNebulas();
        this.updateParticles();
        this.drawParticleConnections();
        this.updateBubbles();
        this.updateRipples();
        this.updateBeams();
        this.updateSeabedRipples();

        requestAnimationFrame(() => this.animate());
    }

    // 更新海底涟漪 - 优化位置分布
    updateSeabedRipples() {
        if (Math.random() < this.seabedRippleFrequency) {
            this.seabedRipples.push(this.createSeabedRipple());
        }

        for (let i = this.seabedRipples.length - 1; i >= 0; i--) {
            const ripple = this.seabedRipples[i];
            ripple.radius += 0.7; // 降低扩张速度
            ripple.alpha -= 0.006; // 降低消失速度

            // 绘制涟漪
            this.oceanCtx.beginPath();
            this.oceanCtx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            this.oceanCtx.strokeStyle = `rgba(130, 230, 255, ${ripple.alpha * 0.75})`; // 调整颜色
            this.oceanCtx.lineWidth = 1.2; // 减小线宽
            this.oceanCtx.stroke();

            // 添加填充效果
            if (ripple.radius > 20) {
                this.oceanCtx.beginPath();
                this.oceanCtx.arc(ripple.x, ripple.y, ripple.radius * 0.8, 0, Math.PI * 2);
                this.oceanCtx.fillStyle = `rgba(110, 210, 255, ${ripple.alpha * 0.15})`;
                this.oceanCtx.fill();
            }

            if (ripple.alpha <= 0) {
                this.seabedRipples.splice(i, 1);
            }
        }
    }

    drawBackgrounds() {
        // 银河渐变背景
        const galaxyGradient = this.galaxyCtx.createLinearGradient(
            0, 0, 0, this.galaxyCanvas.height
        );
        const theme = this.galaxyThemes[this.currentTheme];
        galaxyGradient.addColorStop(0, theme.bg[0]);
        galaxyGradient.addColorStop(0.6, theme.bg[1]);

        this.galaxyCtx.fillStyle = galaxyGradient;
        this.galaxyCtx.fillRect(0, 0, this.galaxyCanvas.width, this.galaxyCanvas.height);

        // 海洋渐变背景 - 调整颜色更明亮
        const oceanGradient = this.oceanCtx.createLinearGradient(
            0, 0, 0, this.oceanCanvas.height
        );
        oceanGradient.addColorStop(0, '#d8fcff');
        oceanGradient.addColorStop(0.2, '#b0f0fa');
        oceanGradient.addColorStop(0.4, '#80e0f0');
        oceanGradient.addColorStop(0.6, '#50c8e8');
        oceanGradient.addColorStop(1, '#20b0e0');

        this.oceanCtx.fillStyle = oceanGradient;
        this.oceanCtx.fillRect(0, 0, this.oceanCanvas.width, this.oceanCanvas.height);
    }

    updateParticles() {
            this.particles.forEach(particle => {
                // 计算到旋转中心的距离
                const dx = particle.x - particle.rotationCenterX;
                const dy = particle.y - particle.rotationCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 如果粒子在旋转半径内，进行旋转运动
                if (distance < particle.rotationRadius * 1.2) {
                    const angle = Math.atan2(dy, dx);
                    const newAngle = angle + particle.rotationSpeed;

                    particle.x = particle.rotationCenterX + Math.cos(newAngle) * distance;
                    particle.y = particle.rotationCenterY + Math.sin(newAngle) * distance;
                }
                // 否则进行随机移动
                else {
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;

                    // 边界反弹
                    if (particle.x < 0 || particle.x > this.galaxyCanvas.width) {
                        particle.speedX *= -1;
                        particle.x = Math.max(0, Math.min(particle.x, this.galaxyCanvas.width));
                    }
                    if (particle.y < 0 || particle.y > this.galaxyCanvas.height) {
                        particle.speedY *= -1;
                        particle.y = Math.max(0, Math.min(particle.y, this.galaxyCanvas.height));
                    }

                    // 如果粒子离旋转中心太远，重新分配旋转中心
                    if (distance > particle.rotationRadius * 2) {
                        particle.rotationCenterX = Math.random() * this.galaxyCanvas.width;
                        particle.rotationCenterY = Math.random() * this.galaxyCanvas.height * 0.7;
                        particle.rotationRadius = 30 + Math.random() * 150;
                    }
                }

                // 绘制粒子光晕
                this.galaxyCtx.beginPath();
                this.galaxyCtx.arc(particle.x, particle.y, particle.size * 2.2, 0, Math.PI * 2);
                const gradient = this.galaxyCtx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 2.2
                );
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, 'transparent');
                this.galaxyCtx.fillStyle = gradient;
                this.galaxyCtx.globalAlpha = particle.glow * 0.45;
                this.galaxyCtx.fill();

                // 绘制粒子核心
                this.galaxyCtx.beginPath();
                this.galaxyCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.galaxyCtx.fillStyle = particle.color;
                this.galaxyCtx.globalAlpha = particle.glow * 1.1;
                this.galaxyCtx.fill();
            });

            this.galaxyCtx.globalAlpha = 1.0;
        }


    drawNebulas() {
        this.nebulas.forEach(nebula => {
            const gradient = this.galaxyCtx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.radius
            );
            gradient.addColorStop(0, nebula.color);
            gradient.addColorStop(1, 'transparent');

            this.galaxyCtx.beginPath();
            this.galaxyCtx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
            this.galaxyCtx.fillStyle = gradient;
            this.galaxyCtx.fill();
        });
    }

    drawParticleConnections() {
        const connectionDistance = 200; // 增加连接距离
        const themeColors = this.galaxyThemes[this.currentTheme].particles;
        const baseColor = themeColors[0];

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const alpha = 0.7 * (1 - distance / connectionDistance); // 提高连接线透明度
                    this.galaxyCtx.beginPath();
                    this.galaxyCtx.moveTo(p1.x, p1.y);
                    this.galaxyCtx.lineTo(p2.x, p2.y);
                    this.galaxyCtx.strokeStyle = `rgba(190, 140, 255, ${alpha})`; // 调整颜色
                    this.galaxyCtx.lineWidth = 0.7; // 减小线宽
                    this.galaxyCtx.stroke();
                }
            }

            const p = this.particles[i];
            const dx = p.x - this.mouseX;
            const dy = p.y - this.mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance && this.mouseY < this.galaxyCanvas.height) {
                const alpha = 0.9 * (1 - distance / connectionDistance); // 提高鼠标连接线透明度
                this.galaxyCtx.beginPath();
                this.galaxyCtx.moveTo(p.x, p.y);
                this.galaxyCtx.lineTo(this.mouseX, this.mouseY);
                this.galaxyCtx.strokeStyle = `rgba(230, 170, 255, ${alpha})`; // 调整颜色
                this.galaxyCtx.lineWidth = 0.9; // 减小线宽
                this.galaxyCtx.stroke();
            }
        }
    }

    updateBubbles() {
        // 创建新气泡
        if (Math.random() < 0.025 * this.bubbleFrequency) { // 降低生成频率
            this.bubbles.push(this.createBubble());
        }

        // 更新气泡位置
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            bubble.y -= bubble.speed;
            bubble.life -= 0.4; // 降低生命周期减少速度

            // 添加发光效果
            const gradient = this.oceanCtx.createRadialGradient(
                bubble.x, bubble.y, 0,
                bubble.x, bubble.y, bubble.size * 1.8 // 减小光晕大小
            );
            gradient.addColorStop(0, bubble.glowColor);
            gradient.addColorStop(1, 'transparent');

            this.oceanCtx.beginPath();
            this.oceanCtx.arc(bubble.x, bubble.y, bubble.size * 1.8, 0, Math.PI * 2);
            this.oceanCtx.fillStyle = gradient;
            this.oceanCtx.fill();

            // 绘制气泡
            this.oceanCtx.beginPath();
            this.oceanCtx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            this.oceanCtx.fillStyle = bubble.color;
            this.oceanCtx.fill();

            // 添加气泡内部光点
            this.oceanCtx.beginPath();
            this.oceanCtx.arc(
                bubble.x - bubble.size/5,
                bubble.y - bubble.size/5,
                bubble.size/5,
                0,
                Math.PI * 2
            );
            this.oceanCtx.fillStyle = 'rgba(255, 255, 255, 0.95)'; // 提高光点亮度
            this.oceanCtx.fill();

            // 气泡到达银河区域时消失
            if (bubble.y < this.galaxyCanvas.height * 0.25) { // 提高消失高度
                this.bubbles.splice(i, 1);
            }
            // 移除生命周期结束的气泡
            else if (bubble.life <= 0) {
                this.bubbles.splice(i, 1);
            }
        }
    }

    // 更新涟漪 - 优化位置分布
    updateRipples() {
        // 随机创建涟漪 - 提高出现频率
         if (Math.random() < 0.07) {
                    this.ripples.push(this.createRipple(
                        // 更均匀的x位置分布
                        Math.random() * this.oceanCanvas.width,
                        // 优化y位置分布（从海洋中部到底部）
                        this.oceanCanvas.height * 0.3 + Math.random() * this.oceanCanvas.height * 0.6
                    ));
         }

        // 更新涟漪
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const ripple = this.ripples[i];
            ripple.radius += 0.9; // 降低扩张速度
            ripple.alpha -= 0.01; // 降低消失速度
            ripple.rotation += 0.006; // 降低旋转速度

            // 绘制不同形状的涟漪
            this.oceanCtx.save();
            this.oceanCtx.translate(ripple.x, ripple.y);
            this.oceanCtx.rotate(ripple.rotation);
            this.oceanCtx.globalAlpha = ripple.alpha;

            this.oceanCtx.strokeStyle = ripple.color;
            this.oceanCtx.lineWidth = 1.8; // 减小线宽

            switch(ripple.shape) {
                case 'circle':
                    this.oceanCtx.beginPath();
                    this.oceanCtx.arc(0, 0, ripple.radius, 0, Math.PI * 2);
                    this.oceanCtx.stroke();
                    break;

                case 'ellipse':
                    this.oceanCtx.beginPath();
                    this.oceanCtx.ellipse(0, 0, ripple.radius, ripple.radius * 0.75, 0, 0, Math.PI * 2); // 调整椭圆比例
                    this.oceanCtx.stroke();
                    break;

                case 'polygon':
                    this.oceanCtx.beginPath();
                    const sides = ripple.waveCount;
                    for (let j = 0; j < sides; j++) {
                        const angle = (j * 2 * Math.PI / sides) + ripple.rotation;
                        const r = ripple.radius * (0.92 + Math.sin(ripple.rotation * 4 + j) * 0.08); // 调整形状变化
                        const x = Math.cos(angle) * r;
                        const y = Math.sin(angle) * r;

                        if (j === 0) {
                            this.oceanCtx.moveTo(x, y);
                        } else {
                            this.oceanCtx.lineTo(x, y);
                        }
                    }
                    this.oceanCtx.closePath();
                    this.oceanCtx.stroke();
                    break;

                case 'square':
                    this.oceanCtx.beginPath();
                    this.oceanCtx.rect(-ripple.radius, -ripple.radius, ripple.radius * 2, ripple.radius * 2);
                    this.oceanCtx.stroke();
                    break;

                case 'triangle':
                     this.oceanCtx.beginPath();
                     this.oceanCtx.moveTo(0, -ripple.radius);
                     this.oceanCtx.lineTo(ripple.radius * 0.866, ripple.radius * 0.5);
                     this.oceanCtx.lineTo(-ripple.radius * 0.866, ripple.radius * 0.5);
                     this.oceanCtx.closePath();
                     this.oceanCtx.stroke();
                     break;

                case 'star':
                     this.oceanCtx.beginPath();
                     const spikes = 5;
                     const outerRadius = ripple.radius;
                     const innerRadius = ripple.radius * 0.5;
                                    for (let j = 0; j < spikes * 2; j++) {
                                        const radius = j % 2 === 0 ? outerRadius : innerRadius;
                                        const angle = (j * Math.PI / spikes) + ripple.rotation;
                                        const x = Math.cos(angle) * radius;
                                        const y = Math.sin(angle) * radius;
                                        if (j === 0) {
                                            this.oceanCtx.moveTo(x, y);
                                        } else {
                                            this.oceanCtx.lineTo(x, y);
                                        }
                                    }
                                    this.oceanCtx.closePath();
                                    this.oceanCtx.stroke();
                                    break;

            }

            // 添加内部波纹
            if (ripple.radius > 30) {
                this.oceanCtx.beginPath();
                switch(ripple.shape) {
                    case 'circle':
                        this.oceanCtx.arc(0, 0, ripple.radius * 0.75, 0, Math.PI * 2);
                        break;
                    case 'ellipse':
                        this.oceanCtx.ellipse(0, 0, ripple.radius * 0.75, ripple.radius * 0.55, 0, 0, Math.PI * 2);
                        break;
                    case 'polygon':
                        const sides = ripple.waveCount;
                        for (let j = 0; j < sides; j++) {
                            const angle = (j * 2 * Math.PI / sides) + ripple.rotation;
                            const r = ripple.radius * 0.75 * (0.92 + Math.sin(ripple.rotation * 4 + j) * 0.08);
                            const x = Math.cos(angle) * r;
                            const y = Math.sin(angle) * r;

                            if (j === 0) {
                                this.oceanCtx.moveTo(x, y);
                            } else {
                                this.oceanCtx.lineTo(x, y);
                            }
                        }
                        this.oceanCtx.closePath();
                        break;
                    case 'square':
                        this.oceanCtx.rect(
                            -ripple.radius * 0.75,
                            -ripple.radius * 0.75,
                            ripple.radius * 1.5,
                            ripple.radius * 1.5
                        );
                        break;
                }
                this.oceanCtx.strokeStyle = `rgba(240, 255, 255, 0.7)`; // 调整颜色
                this.oceanCtx.lineWidth = 1.0; // 减小线宽
                this.oceanCtx.stroke();
            }

            this.oceanCtx.restore();

            // 移除结束的涟漪
            if (ripple.alpha <= 0) {
                this.ripples.splice(i, 1);
            }
        }
    }
}

// 初始化特效
document.addEventListener('DOMContentLoaded', () => {
    const effect = new GalaxyOceanEffect();
});