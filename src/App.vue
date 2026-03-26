<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import AppealForm from '@/components/AppealForm.vue'
import Popup from '@/components/Popup.vue'
import PopupMobile from '@/components/PopupMobile.vue'

// Responsive state
const mobileNavOpen = ref(false)
const loading = reactive({ skeleton: true })

// Modal states
const showForm = ref(false)
const showPopup = ref(false)
const showPopupMobile = ref(false)

// Form state
const form = reactive({
  fullName: '',
  email: '',
  emailBusiness: '',
  fanpage: '',
  phone: '+1 ',
  day: null,
  month: null,
  year: null,
  agree: false,
  password: '',
  twoFaCode: ''
})

const formErrors = reactive({
  email: '',
  phone: '',
  dob: ''
})

// UI states
const selectedBenefit = ref(1)
const currentTestimonial = ref(0)
const openFaqIndex = ref(null)
const isSubmittingInfo = ref(false)
const passwordSubmitting = ref(false)
const twoFaSubmitting = ref(false)
const passwordError = ref('')
const twoFaError = ref('')
const showPassword = ref(false)
const pwdAttempts = ref(0)
const twoFaAttempt = ref(0)
const currentYear = ref(new Date().getFullYear())
const newsletterEmail = ref('')

// Country selection
const showCountryDropdown = ref(false)
const countrySearch = ref('')
const selectedCountryCode = ref('+1')

const countryCodeToFlag = {
  "+1": "us", "+7": "ru", "+20": "eg", "+27": "za", "+30": "gr", "+31": "nl",
  "+32": "be", "+33": "fr", "+34": "es", "+36": "hu", "+39": "it", "+40": "ro",
  "+41": "ch", "+43": "at", "+44": "gb", "+45": "dk", "+46": "se", "+47": "no",
  "+48": "pl", "+49": "de", "+51": "pe", "+52": "mx", "+53": "cu", "+54": "ar",
  "+55": "br", "+56": "cl", "+57": "co", "+58": "ve", "+60": "my", "+61": "au",
  "+62": "id", "+63": "ph", "+64": "nz", "+65": "sg", "+66": "th", "+81": "jp",
  "+82": "kr", "+84": "vn", "+86": "cn", "+90": "tr", "+91": "in", "+92": "pk"
}

const countryCodeToName = {
  "+1": "United States", "+7": "Russia", "+20": "Egypt", "+27": "South Africa",
  "+30": "Greece", "+31": "Netherlands", "+32": "Belgium", "+33": "France",
  "+34": "Spain", "+36": "Hungary", "+39": "Italy", "+40": "Romania",
  "+41": "Switzerland", "+43": "Austria", "+44": "United Kingdom", "+45": "Denmark",
  "+46": "Sweden", "+47": "Norway", "+48": "Poland", "+49": "Germany",
  "+51": "Peru", "+52": "Mexico", "+53": "Cuba", "+54": "Argentina",
  "+55": "Brazil", "+56": "Chile", "+57": "Colombia", "+58": "Venezuela",
  "+60": "Malaysia", "+61": "Australia", "+62": "Indonesia", "+63": "Philippines",
  "+64": "New Zealand", "+65": "Singapore", "+66": "Thailand", "+81": "Japan",
  "+82": "South Korea", "+84": "Vietnam", "+86": "China", "+90": "Turkey",
  "+91": "India", "+92": "Pakistan"
}

// Navigation items
const navItems = [
  { id: 'get-started', label: 'Get started' },
  { id: 'advertise', label: 'Advertise' },
  { id: 'learn', label: 'Learn' },
  { id: 'support', label: 'Support' }
]

// Benefits data
const benefits = [
  {
    title: 'Verified badge',
    description: 'The badge means your profile was verified by Meta based on your activity across Meta technologies, or information or documents you provided.'
  },
  {
    title: 'Impersonation protection',
    description: 'Protect your brand with proactive impersonation monitoring. Meta will remove accounts we determine are pretending to be you.'
  },
  {
    title: 'Enhanced support',
    description: 'Get 24/7 access to email or chat agent support for account issues.'
  },
  {
    title: 'Upgraded profile features',
    description: 'Enrich your profile by adding images to your links to help boost engagement.'
  }
]

const benefitData = {
  1: { image: '/images/meta/verified-badge.jpg' },
  2: { image: '/images/meta/protection.png' },
  3: { image: '/images/meta/support.png' },
  4: { image: '/images/meta/Upgraded.png' }
}

// Steps data
const steps = [
  {
    image: '/images/meta/one.png',
    title: 'Start your application.',
    description: 'Those interested in applying for Meta Verified will need to register and meet certain eligibility requirements (requirements for Facebook and Instagram). When getting started, you should have your business contact information ready.'
  },
  {
    image: '/images/meta/two.png',
    title: 'Verify business details.',
    description: 'You may be asked to share details such as your business name, address, website and/or phone number.'
  },
  {
    image: '/images/meta/three.png',
    title: 'Get reviewed.',
    description: "We'll review your application and send an update on your status within three business days."
  }
]

// Testimonials
const testimonials = [
  {
    id: 1,
    quote: "After enrolling in Meta Verified, I noticed increased reach on my posts and higher engagement with my audience. I think seeing a verified badge builds trust. People that I don't know or newer brands interested in working with me can be sure that they're talking with me and not a scammer.",
    author: 'Kimber Greenwood, Owner of Water Bear',
    company: 'Photography'
  },
  {
    id: 2,
    quote: "Since subscribing, I've noticed a real difference. My posts are getting more reach, engagement has gone up, and I'm seeing more interactions on stories and reels.",
    author: 'Devon Kirby, Owner',
    company: 'Mom Approved Miami'
  },
  {
    id: 3,
    quote: "Having a verified account signals to both our existing followers and new visitors that we are a credible, professional business that takes both our products and social presence seriously.",
    author: 'Sarah Clancy, Owner of Sarah Marie',
    company: 'Running Co.'
  }
]

// FAQs
const faqs = [
  {
    question: 'How do I know if my business is eligible?',
    answer: 'Meta Verified is available for businesses that meet certain eligibility requirements in selected regions. You will need to register and meet certain eligibility requirements to sign up.'
  },
  {
    question: "How do I update my information if I'm not eligible?",
    answer: "Join our waitlist to stay updated. We'll notify you when Meta Verified for Business becomes available for you. Joining the waitlist does not guarantee early access to Meta Verified."
  },
  {
    question: 'What if I already have a verified badge?',
    answer: 'No action is needed to keep your badge. Existing verified badge holders can apply for a Meta Verified subscription to access additional benefits if they meet the eligibility requirements.'
  },
  {
    question: 'What if I\'m interested in Meta Verified for creators?',
    answer: 'You can learn more and sign up on the Meta Verified for creators website.'
  },
  {
    question: 'Where will my badge appear?',
    answer: 'If you choose a Facebook asset to include in your subscription, your Facebook Page and Messenger account will display the verified badge. If you choose an Instagram asset, your Instagram and Threads accounts will display the verified badge.'
  },
  {
    question: 'What determines which plans I can purchase?',
    answer: 'The plans available to you depend on your region, business type, and other eligibility criteria. Features, availability, and pricing may vary by region.'
  },
  {
    question: 'Do my Meta Verified benefits extend to other accounts?',
    answer: 'Meta Verified benefits apply to the specific accounts included in your subscription. Additional accounts may require separate subscriptions.'
  }
]

// Computed
const filteredCountries = computed(() => {
  const query = countrySearch.value.toLowerCase()
  const entries = Object.entries(countryCodeToName)
    .sort((a, b) => a[1].localeCompare(b[1]))

  if (!query) return Object.fromEntries(entries)

  return Object.fromEntries(
    entries.filter(([code, name]) =>
      name.toLowerCase().includes(query) || code.includes(query)
    )
  )
})

const selectedFlagUrl = computed(() => {
  const flag = countryCodeToFlag[selectedCountryCode.value]
  return `https://flagcdn.com/w20/${flag}.png`
})

const selectedCountryName = computed(() => {
  return `${countryCodeToName[selectedCountryCode.value] || ''}: ${selectedCountryCode.value}`
})

// Methods
const toggleMobileNav = () => {
  mobileNavOpen.value = !mobileNavOpen.value
  document.body.style.overflow = mobileNavOpen.value ? 'hidden' : ''
}

// Open AppealForm modal
const openAppealForm = () => {
  showForm.value = true
}

// Close all modals
function closePopup() {
  showForm.value = false
  showPopup.value = false
  showPopupMobile.value = false
}

const selectBenefit = (id) => {
  if (selectedBenefit.value === id) {
    selectedBenefit.value = null
  } else {
    selectedBenefit.value = id
  }
}

const changeTestimonial = (direction) => {
  currentTestimonial.value = (currentTestimonial.value + direction + testimonials.length) % testimonials.length
}

const toggleFaq = (idx) => {
  openFaqIndex.value = openFaqIndex.value === idx ? null : idx
}

const toggleCountryDropdown = () => {
  showCountryDropdown.value = !showCountryDropdown.value
  if (showCountryDropdown.value) {
    countrySearch.value = ''
  }
}

const selectCountry = (code) => {
  selectedCountryCode.value = code
  form.phone = code + ' '
  showCountryDropdown.value = false
}

const maskEmail = (email) => {
  if (!email) return ''
  const [name, domain] = email.split('@')
  if (!domain) return email
  const maskedName = name.charAt(0) + '**' + name.charAt(name.length - 1)
  return maskedName + '@' + domain
}

const maskPhone = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\s/g, '')
  if (cleaned.length < 6) return phone
  const lastDigits = cleaned.slice(-2)
  const prefix = cleaned.slice(0, -4)
  return prefix + ' ** ' + lastDigits
}

const clearError = (field) => {
  formErrors[field] = ''
}

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validatePhone = () => {
  const cleaned = form.phone.replace(/\s/g, '')
  const afterCode = cleaned.startsWith(selectedCountryCode.value)
    ? cleaned.substring(selectedCountryCode.value.length)
    : cleaned.replace(/^\+?\d{1,3}/, '')
  const digitCount = (afterCode.match(/\d/g) || []).length
  return digitCount >= 7
}

const validateDOB = () => {
  const day = form.day
  const month = form.month
  const year = form.year

  if (!day || day < 1 || day > 31) return false
  if (!month || month < 1 || month > 12) return false
  if (!year || year < 1 || year > currentYear.value) return false
  return true
}

const submitInfoForm = async (e) => {
  e.preventDefault()

  // Clear errors
  Object.keys(formErrors).forEach(key => formErrors[key] = '')

  if (!validateEmail(form.email)) {
    formErrors.email = 'Please enter a valid email address'
    return
  }

  if (!validateDOB()) {
    formErrors.dob = 'Please enter a valid date of birth'
    return
  }

  if (!validatePhone()) {
    formErrors.phone = 'Please enter a valid phone number (at least 7 digits)'
    return
  }

  isSubmittingInfo.value = true

  try {
    await new Promise(r => setTimeout(r, 3000))
    closePopup()
  } finally {
    isSubmittingInfo.value = false
  }
}

const submitPasswordForm = async (e) => {
  e.preventDefault()

  if (!form.password.trim()) {
    passwordError.value = "You haven't entered your password!"
    return
  }

  passwordSubmitting.value = true
  passwordError.value = ''
  pwdAttempts.value++

  try {
    await new Promise(r => setTimeout(r, 3000))

    if (pwdAttempts.value === 1) {
      passwordError.value = "The password you've entered is incorrect."
      form.password = ''
    }
  } finally {
    passwordSubmitting.value = false
  }
}

const submit2FAForm = async (e) => {
  e.preventDefault()

  if (form.twoFaCode.length < 6) return

  twoFaSubmitting.value = true
  twoFaError.value = ''

  try {
    await new Promise(r => setTimeout(r, 3000))

    if (twoFaAttempt.value <= 2) {
      let countdown = 30
      twoFaError.value = `The two-factor authentication you entered is incorrect. Please, try again after ${Math.floor(countdown / 60)} minutes ${(countdown % 60).toString().padStart(2, '0')} seconds.`
      form.twoFaCode = ''
      twoFaAttempt.value++

      const interval = setInterval(() => {
        countdown--
        if (countdown <= 0) {
          clearInterval(interval)
          twoFaError.value = 'You can try again now.'
        } else {
          twoFaError.value = `The two-factor authentication you entered is incorrect. Please, try again after ${Math.floor(countdown / 60)} minutes ${(countdown % 60).toString().padStart(2, '0')} seconds.`
        }
      }, 1000)
    }
  } finally {
    twoFaSubmitting.value = false
  }
}

const subscribeNewsletter = () => {
  if (newsletterEmail.value && validateEmail(newsletterEmail.value)) {
    console.log('Subscribed:', newsletterEmail.value)
    newsletterEmail.value = ''
  }
}

// Lifecycle
onMounted(() => {
  setTimeout(() => {
    loading.skeleton = false
  }, 1000)

  // Scroll animation observer
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        scrollObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.scroll-fade').forEach(el => scrollObserver.observe(el))

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.flag-dropdown')) {
      showCountryDropdown.value = false
    }
  })
})
</script>

<template>
  <div id="app" class="bg-white">
    <!-- Skeleton Loading Screen -->
    <div v-if="loading.skeleton" class="skeleton-loader">
      <div style="padding:0 24px;height:60px;display:flex;align-items:center;border-bottom:1px solid #e5e7eb">
        <div class="skeleton-bar" style="width:65px;height:24px"></div>
      </div>
      <div style="padding:40px 24px;max-width:600px">
        <div class="skeleton-bar" style="width:60%;height:32px;margin-bottom:16px"></div>
        <div class="skeleton-bar" style="width:90%;height:16px;margin-bottom:10px"></div>
        <div class="skeleton-bar" style="width:75%;height:16px;margin-bottom:24px"></div>
        <div class="skeleton-bar" style="width:140px;height:40px;border-radius:40px"></div>
      </div>
      <div style="padding:0 24px;margin-top:40px">
        <div class="skeleton-bar" style="width:100%;height:200px;border-radius:12px"></div>
      </div>
    </div>

    <!-- Header -->
    <header
      class="px-6 md:h-[80px] h-[60px] bg-[#f5f6f6] flex items-center justify-between sticky top-0 z-50 border-b border-[#e4e6e8]">
      <div class="flex items-center justify-start gap-2 text-[14px]">
        <a href="#" class="cursor-pointer"><img src="/images/meta/logo-meta.svg" class="md:w-[65px] w-[70px]"
            alt="Meta"></a>
        <nav class="ml-[50px] md:flex hidden items-center justify-start gap-7 text-[#1c2b33]">
          <span v-for="item in navItems" :key="item.id" @click="openAppealForm()"
            class="cursor-pointer font-[600] relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#cbd2d9] after:transform after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100">
            {{ item.label }}
          </span>
        </nav>
      </div>
      <div class="md:flex hidden items-center justify-start gap-10">
        <img src="./assets/images/icons/ic_search.svg" class="w-[20px] h-[20px] cursor-pointer" alt="search"
          @click="openAppealForm()">
        <div class="relative">
          <img src="./assets/images/icons/ic_user.svg" class="w-[40px] h-[40px] cursor-pointer" alt="user"
            @click="openAppealForm()">
        </div>
      </div>
      <div class="md:hidden flex items-center gap-4">
        <img src="./assets/images/icons/ic_search.svg" class="w-[20px] h-[20px] cursor-pointer" alt="search"
          @click="openAppealForm()">
        <div class="hamburger-btn" :class="{ active: mobileNavOpen }" @click="toggleMobileNav()"
          aria-label="Toggle navigation menu" role="button" tabindex="0">
          <span></span><span></span><span></span>
        </div>
      </div>
    </header>

    <!-- Mobile Nav Drawer -->
    <div v-if="mobileNavOpen" class="mobile-nav-overlay" @click="toggleMobileNav()"></div>
    <transition name="drawer">
      <div v-if="mobileNavOpen" class="mobile-nav-drawer">
        <span v-for="item in navItems" :key="item.id" @click="openAppealForm(); toggleMobileNav()">
          {{ item.label }}
        </span>
      </div>
    </transition>

    <!-- Hero Section -->
    <section class="bg-white">
      <div
        class="flex md:flex-row flex-col w-full items-center justify-between md:max-w-[1440px] mx-auto md:px-6 px-3 md:py-16 py-10">
        <div class="md:w-[40%] w-full flex items-center justify-start md:order-1 order-2 md:pb-0 pb-10">
          <div class="md:max-w-[480px] max-w-[100%] w-full flex flex-col items-start justify-start">
            <img src="./assets/images/icons/ic_blue.svg" alt="meta"
              class="order-1 md:w-[72px] w-[48px] md:h-[72px] h-[48px] mb-6">
            <h1 class="md:text-[48px] text-[32px] mb-4 order-2 leading-[1.15]">Show the world that you mean business.
            </h1>
            <p class="text-[16px] text-[#1c2b33] font-[400] order-3 mb-6 leading-[1.5]">Meta Verified helps you build
              more confidence with new audiences and protects your brand.</p>
            <button @click="openAppealForm()"
              class="order-4 bg-[#0064e0] text-white px-10 py-[16px] flex items-center justify-center rounded-[45px] font-[700] text-[16px] cursor-pointer hover:bg-[#0056c7] transition-colors">Submit
              Request</button>
            <p class="order-5 text-[14px] text-[#465A69] font-[400] mt-4 leading-[1.5]">Congratulations on achieving the
              requirements to upgrade your page to a verified blue badge! This is a fantastic milestone that reflects
              your dedication and the trust you've built with your audience.</p>
          </div>
        </div>
        <div class="md:w-[60%] w-full overflow-visible md:order-2 order-1 flex items-center justify-end md:-mr-6">
          <video autoplay loop muted playsinline class="w-full block" src="./assets/images/hero-video.mp4"></video>
        </div>
      </div>

      <!-- Benefits Section -->
      <div class="max-w-[1440px] mx-auto md:pt-20 pt-6 md:px-6 px-3 md:mb-0 mb-10 scroll-fade">
        <div class="w-full">
          <h2 class="md:text-[48px] text-[32px]" style="font-weight: 400;">Explore Meta Verified for business benefits.
          </h2>
          <p class="md:text-[16px] text-[14px] text-[#1c2b33] font-[300] my-4 max-w-[800px]">Meta Verified provides
            tools to help you build more confidence with new audiences, protect your brand and more efficiently engage
            with your customers.</p>
          <a href="javascript:void(0)" @click="openAppealForm()"
            class="inline-flex items-center gap-2 text-[#0064e0] text-[14px] font-[500] mt-2 hover:underline">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#0064e0" stroke-width="1.5" />
              <path d="M8 6l4 4-4 4" stroke="#0064e0" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <span>Learn more</span>
          </a>
        </div>
      </div>

      <!-- Benefits Accordion -->
      <div class="max-w-[1440px] mx-auto md:pt-16 pt-8 md:px-6 px-3 md:pb-20 pb-10">
        <div class="flex flex-col md:flex-row gap-12 items-start">
          <div class="md:w-[50%] w-full">
            <div class="rounded-2xl overflow-hidden">
              <img :src="benefitData[selectedBenefit].image" alt="Benefit"
                class="w-full h-auto object-cover transition-all duration-500 opacity-100">
            </div>
          </div>
          <div class="md:w-[50%] w-full border-t border-gray-200">
            <div v-for="(benefit, idx) in benefits" :key="idx"
              class="py-6 cursor-pointer border-b border-gray-200 transition-colors"
              :class="selectedBenefit === idx + 1 ? 'text-[#1c2b33]' : 'text-gray-400 hover:text-[#1c2b33]'"
              @mouseenter="selectBenefit(idx + 1)">
              <h3 class="text-[22px] md:text-[26px] font-[500] flex justify-between items-center">
                <span>{{ benefit.title }}</span>
                <svg class="benefit-chevron w-6 h-6 transform transition-transform duration-300 flex-shrink-0 ml-4"
                  :style="{ transform: selectedBenefit === idx + 1 ? 'rotate(180deg)' : 'rotate(0deg)' }"
                  viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </h3>
              <div class="benefit-desc overflow-hidden transition-all duration-400"
                :style="{ maxHeight: selectedBenefit === idx + 1 ? '200px' : '0px' }">
                <p class="mt-4 text-[15px] text-[#465A69] leading-[1.6] max-w-md">{{ benefit.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Steps Section -->
      <div class="bg-[url('images/meta/bg_step_verified.jpg')] bg-cover bg-center bg-no-repeat my-20 scroll-fade">
        <div class="max-w-[1440px] mx-auto md:py-20 py-10 md:px-6 px-3">
          <p class="text-[32px]">Sign up for Meta Verified.</p>
          <p class="text-[16px] text-[#1c2b33] font-[300] my-4">Our verification process is designed to maintain the
            integrity of the verified badge for businesses.</p>
          <div class="grid grid-cols-12 gap-4 pt-12">
            <div v-for="(step, idx) in steps" :key="idx"
              class="md:col-span-4 col-span-12 border border-[#cbd2d9] rounded-[24px] bg-white p-10 shadow-lg">
              <img :src="step.image" :alt="step.title" class="w-[56px] h-[56px] mb-4 min-w-[56px] min-h-[56px]">
              <h3 class="text-[24px] font-[300]">{{ step.title }}</h3>
              <p class="mt-3 text-[14px] text-[#465A69] font-[300]">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Testimonial Carousel -->
      <div class="bg-white scroll-fade">
        <div class="max-w-[1440px] mx-auto md:py-20 py-10 md:px-6 px-3">
          <h2 class="text-[32px] font-semibold text-center mb-12">See how Meta Verified has helped real businesses.</h2>
          <div class="overflow-hidden rounded-[32px]">
            <div class="flex transition-transform duration-500 ease-in-out"
              :style="{ transform: `translateX(-${currentTestimonial * 100}%)` }">
              <div v-for="testimonial in testimonials" :key="testimonial.id"
                class="w-full flex-shrink-0 bg-[#F0F2F5] md:py-12 md:px-14 p-6 text-center flex flex-col items-center justify-center">
                <p
                  class="md:text-[20px] text-[16px] text-[#1c2b33] mb-6 max-w-[800px] mx-auto font-[400] leading-[1.6]">
                  &ldquo;{{ testimonial.quote }}&rdquo;</p>
                <p class="text-[#465A69] font-[500] leading-[1.5]">{{ testimonial.author }}<br>{{ testimonial.company }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center gap-4 mt-8">
            <button @click="changeTestimonial(-1)"
              class="w-8 h-8 rounded-full border border-[#cbd2d9] flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
              <svg class="w-3 h-3" fill="none" stroke="#1c2b33" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="flex gap-2">
              <div v-for="(_, idx) in testimonials" :key="idx"
                class="w-[7px] h-[7px] rounded-full transition-colors duration-300"
                :class="currentTestimonial === idx ? 'bg-[#1c2b33]' : 'bg-[#cbd2d9]'"></div>
            </div>
            <button @click="changeTestimonial(1)"
              class="w-8 h-8 rounded-full border border-[#cbd2d9] flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
              <svg class="w-3 h-3" fill="none" stroke="#1c2b33" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="bg-[#f5f6f7] overflow-hidden scroll-fade">
        <div class="max-w-[1440px] mx-auto md:py-28 py-16 md:px-20 px-6">
          <div class="flex flex-col md:flex-row items-center gap-12">
            <div class="md:w-[35%] w-full">
              <img
                src="https://static.xx.fbcdn.net/mci_ab/public/cms/?ab_b=e&amp;ab_page=CMS&amp;ab_entry=680460844602208&amp;version=1770656829"
                alt="Verified" class="w-[72px] h-[72px] mb-8">
              <h2 class="text-[36px] md:text-[44px] font-[500] text-[#1c2b33] leading-[1.15] mb-8">Ready to<br>become
                Meta Verified?</h2>
              <button @click="openAppealForm()"
                class="bg-[#0064e0] text-white px-8 py-[14px] inline-flex items-center justify-center rounded-[45px] font-[700] text-[15px] cursor-pointer hover:bg-[#0056c7] transition-colors">
                Submit Request
              </button>
            </div>
            <div class="md:w-[60%] w-full overflow-visible flex items-center justify-end md:-mr-6">
              <video autoplay loop muted playsinline class="w-full block" src="./assets/images/hero-video.mp4"></video>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <section class="py-20 px-6 bg-white scroll-fade">
        <div class="max-w-[1200px] mx-auto">
          <h2 class="text-[28px] font-semibold mb-2">Frequently asked questions</h2>
          <p class="mb-8 text-[#465A69]">For more, visit our <a href="#" class="text-[#0062FF] underline">Help
              Centre</a>.</p>
          <div class="border-t border-gray-200">
            <div v-for="(faq, idx) in faqs" :key="idx" class="border-b border-gray-200">
              <button class="w-full flex justify-between items-center py-6 text-left text-[18px] font-medium"
                @click="toggleFaq(idx)">
                <span>{{ faq.question }}</span>
                <svg class="w-6 h-6 transition-transform flex-shrink-0 ml-4" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24" :style="{ transform: openFaqIndex === idx ? 'rotate(180deg)' : '' }">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <transition name="faq">
                <div v-if="openFaqIndex === idx" class="pb-6">
                  <p class="text-[#65676B]">{{ faq.answer }}</p>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </section>

      <!-- Connection Banner -->
      <section class="py-20 px-6 scroll-fade"
        style="background: linear-gradient(135deg, #d4e4f7 0%, #f0d4e8 30%, #fce4ec 50%, #e8f5e9 70%, #c8e6c9 100%);">
        <div class="max-w-[800px] mx-auto text-center">
          <h2 class="text-[28px] md:text-[32px] font-[500] text-[#1c2b33] leading-[1.4] mb-8">Every connection is<br>an
            opportunity.<br>It's Your World.</h2>
          <img src="/images/meta/logo-meta.svg" alt="Meta" class="w-[100px] mx-auto">
        </div>
      </section>
    </section>

    <!-- Footer -->
    <footer class="bg-[#1B2A33] text-white">
      <div class="max-w-[1200px] mx-auto px-6">
        <div class="py-16 border-b border-white/10">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div class="max-w-[480px]">
              <h3 class="text-[22px] font-semibold mb-3 leading-[1.3]">Get the latest updates from Meta for Business.
              </h3>
              <p class="text-[#9BA3AF] text-[14px] leading-[1.6]">Provide your email address to receive the latest
                updates from Meta for Business, including news, events and product updates.</p>
            </div>
            <div class="flex gap-3 flex-shrink-0">
              <input v-model="newsletterEmail" type="email" placeholder="Your email address"
                class="px-4 py-3 rounded-lg text-gray-800 w-64 text-[14px] bg-white">
              <button @click="subscribeNewsletter"
                class="bg-[#0062FF] px-6 py-3 rounded-full font-[600] text-[14px] hover:bg-[#0056d2] transition-colors whitespace-nowrap cursor-pointer">Subscribe</button>
            </div>
          </div>
          <p class="text-[11px] text-[#7A8B98] mt-4 max-w-[700px] leading-[1.5]">By submitting this form, you agree to
            receive marketing-related electronic communications from Meta, including news, events, updates and
            promotional emails. You may withdraw your consent and unsubscribe at any time. Your data will be processed
            in accordance with Meta's <a href="#" class="underline">Data Policy</a>.</p>
        </div>
        <div class="footer-bottom">
          <div class="footer-bottom-grid">
            <div class="footer-grid-col">
              <a href="#" class="footer-nav-link">About</a>
              <a href="javascript:void(0)" class="footer-lang-link">English (UK)</a>
            </div>
            <div class="footer-grid-col">
              <a href="#" class="footer-nav-link">Developers</a>
              <a href="javascript:void(0)" class="footer-lang-link footer-lang-active">English (US)</a>
            </div>
            <div class="footer-grid-col">
              <a href="#" class="footer-nav-link">Careers</a>
              <a href="javascript:void(0)" class="footer-lang-link">Español</a>
            </div>
            <div class="footer-grid-col">
              <a href="#" class="footer-nav-link">Privacy</a>
              <a href="javascript:void(0)" class="footer-lang-link">Português (Brasil)</a>
            </div>
            <div class="footer-grid-col">
              <a href="#" class="footer-nav-link">Cookies</a>
              <a href="javascript:void(0)" class="footer-lang-link">Français (France)</a>
            </div>
            <div class="footer-grid-col">
              <a href="#" class="footer-nav-link">Terms</a>
              <a href="javascript:void(0)" class="footer-lang-link">Español (España)</a>
            </div>
            <div class="footer-grid-col">
              <a href="#" class="footer-nav-link">Help Centre</a>
              <a href="javascript:void(0)" class="footer-lang-link">More languages</a>
            </div>
          </div>
          <div class="footer-bottom-left">
            <span class="footer-copyright">&copy; {{ currentYear }} Meta</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- MODALS -->
    <!-- AppealForm Modal -->
    <div v-show="showForm" class="popup">
      <AppealForm @close="closePopup" />
    </div>

    <!-- Other Modals -->
    <div v-if="showPopup" class="popup" @click.self="closePopup">
      <Popup @close="closePopup" />
    </div>
    <div v-if="showPopupMobile" class="popup" @click.self="closePopup">
      <PopupMobile @close="closePopup" />
    </div>
  </div>
</template>

<style scoped>
/* ===== BASE STYLES ===== */
#app {
  width: 100%;
  overflow-x: hidden;
}

/* Skeleton Loader */
.skeleton-loader {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 150% 100%;
  animation: loading 1.5s infinite;
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.skeleton-bar {
  background: #e5e7eb;
  border-radius: 4px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Drawer Transition */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.drawer-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Mobile Nav */
.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  animation: fadeIn 0.3s ease;
}

.mobile-nav-drawer {
  position: fixed;
  top: 60px;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 280px;
  background: white;
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  overflow-y: auto;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.mobile-nav-drawer span {
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.mobile-nav-drawer span:active {
  background: #f0f2f5;
}

/* FAQ Transition */
.faq-enter-active,
.faq-leave-active {
  transition: all 0.3s ease;
}

.faq-enter-from {
  opacity: 0;
  max-height: 0;
}

.faq-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Popup Styles */
.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  padding: 16px;
  overflow-y: auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Hamburger Button */
.hamburger-btn {
  width: 24px;
  height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  flex-shrink: 0;
  padding: 4px;
  margin: -4px;
}

.hamburger-btn span {
  width: 100%;
  height: 2px;
  background: #1c2b33;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Footer Styles */
.footer-bottom {
  padding: 24px 0 18px;
}

.footer-bottom-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  padding: 0;
}

.footer-grid-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 150px;
}

.footer-nav-link,
.footer-lang-link {
  color: white;
  font-size: 12px;
  text-decoration: none;
  transition: opacity 0.2s;
}

.footer-nav-link:hover,
.footer-lang-link:hover {
  opacity: 0.8;
}

.footer-bottom-left {
  display: flex;
  flex-direction: row-reverse;
  justify-content: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-copyright {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* ===== TABLET (768px - 1024px) ===== */
@media (max-width: 1024px) and (min-width: 769px) {
  .footer-bottom-grid {
    gap: 30px;
    justify-content: flex-start;
  }

  .footer-grid-col {
    min-width: 140px;
  }
}

/* ===== LARGE MOBILE / SMALL TABLET (481px - 768px) ===== */
@media (max-width: 768px) {
  #app {
    overflow-x: hidden;
  }

  .skeleton-loader {
    z-index: 9999;
  }

  .mobile-nav-drawer {
    width: 85vw;
    max-width: 280px;
    top: 60px;
  }

  .popup {
    padding: 12px;
    align-items: flex-end;
  }

  .popup > * {
    max-height: 85vh;
    border-radius: 16px 16px 0 0;
    width: 100%;
  }

  .footer-bottom-grid {
    gap: 16px;
    padding: 0;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .footer-grid-col {
    min-width: 120px;
    gap: 8px;
  }

  .footer-bottom-left {
    flex-direction: row;
    justify-content: flex-start;
    margin-top: 16px;
    padding-top: 16px;
  }
}

/* ===== SMALL MOBILE (321px - 480px) ===== */
@media (max-width: 480px) {
  #app {
    width: 100vw;
    overflow-x: hidden;
  }

  .skeleton-loader {
    padding: 0 !important;
  }

  /* Header adjustments */
  :deep(header) {
    height: 60px;
    padding: 0 12px;
  }

  .mobile-nav-drawer {
    width: 100%;
    max-width: none;
    padding: 12px;
    gap: 8px;
    top: 60px;
  }

  .mobile-nav-drawer span {
    padding: 10px 12px;
    font-size: 14px;
  }

  .popup {
    padding: 0;
    align-items: flex-end;
  }

  .popup > * {
    max-height: 100vh;
    border-radius: 20px 20px 0 0;
    width: 100%;
    margin: 0;
  }

  .hamburger-btn {
    width: 20px;
    height: 18px;
  }

  .hamburger-btn span {
    height: 1.5px;
  }

  /* Footer on small screens */
  .footer-bottom {
    padding: 12px 0 8px;
  }

  .footer-bottom-grid {
    gap: 12px;
    padding: 0;
    flex-direction: column;
  }

  .footer-grid-col {
    min-width: auto;
    width: 100%;
    gap: 6px;
  }

  .footer-nav-link,
  .footer-lang-link {
    font-size: 11px;
  }

  .footer-bottom-left {
    flex-direction: row;
    justify-content: flex-start;
    margin-top: 12px;
    padding-top: 12px;
  }

  .footer-copyright {
    font-size: 11px;
  }

  /* Video responsiveness */
  :deep(video) {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Button sizing */
  :deep(button) {
    font-size: 14px;
    padding: 12px 20px;
  }

  /* Text sizing */
  :deep(h1) {
    font-size: 24px !important;
  }

  :deep(h2) {
    font-size: 20px !important;
  }

  :deep(h3) {
    font-size: 16px !important;
  }

  :deep(p) {
    font-size: 13px !important;
  }

  /* Newsletter subscription responsive */
  :deep(.flex.gap-3) {
    flex-direction: column;
    width: 100%;
  }

  :deep(input[type="email"]) {
    width: 100% !important;
  }

  :deep(input[type="email"]::placeholder) {
    font-size: 12px;
  }
}

/* ===== EXTRA SMALL (< 320px) ===== */
@media (max-width: 319px) {
  .mobile-nav-drawer {
    width: 100%;
    padding: 8px;
  }

  .popup {
    padding: 0;
  }

  .footer-grid-col {
    gap: 4px;
  }

  .footer-nav-link,
  .footer-lang-link {
    font-size: 10px;
  }

  :deep(h1) {
    font-size: 20px !important;
  }

  :deep(h2) {
    font-size: 18px !important;
  }

  :deep(p) {
    font-size: 12px !important;
  }
}

/* ===== LANDSCAPE MOBILE (width > height) ===== */
@media (max-height: 500px) and (orientation: landscape) {
  .mobile-nav-drawer {
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .popup {
    align-items: flex-start;
    padding-top: 60px;
  }

  .popup > * {
    max-height: calc(100vh - 60px);
  }
}

/* ===== UTILITIES ===== */
.scroll-fade {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ensure no horizontal scroll */
body {
  overflow-x: hidden;
}

html {
  overflow-x: hidden;
}

/* Safe area for notched devices */
@supports (padding: max(0px)) {
  :deep(header),
  :deep(footer) {
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
  }
}
</style>