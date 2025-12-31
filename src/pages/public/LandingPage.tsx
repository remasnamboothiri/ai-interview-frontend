import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import {
  Video, Bot, Users, TrendingUp, CheckCircle,
  Star, ArrowRight, Zap, Shield, Clock
} from 'lucide-react';

export const LandingPage = () => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-primary-600" />,
      title: 'AI-Powered Interviews',
      description: 'Conduct intelligent, consistent interviews with our advanced AI agents'
    },
    {
      icon: <Clock className="w-8 h-8 text-primary-600" />,
      title: 'Save Time',
      description: 'Reduce hiring time by 70% with automated interview scheduling and evaluation'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Unbiased Evaluation',
      description: 'Fair, consistent assessment based on skills and qualifications, not bias'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      title: 'Data-Driven Insights',
      description: 'Make better hiring decisions with comprehensive analytics and reports'
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Head of HR, TechCorp',
      content: 'This platform revolutionized our hiring process. We\'ve cut our time-to-hire by 60%.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Recruitment Manager, StartupXYZ',
      content: 'The AI interviews are incredibly thorough and unbiased. Best investment we\'ve made.',
      rating: 5,
    },
    {
      name: 'Emma Davis',
      role: 'CEO, GrowthLabs',
      content: 'Fantastic platform! The analytics help us identify top talent quickly and efficiently.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-secondary">AI Interview Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-secondary mb-6 leading-tight">
          Hire Smarter with<br />
          <span className="text-primary-600">AI-Powered Interviews</span>
        </h1>
        <p className="text-xl text-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Streamline your recruitment process with intelligent AI interviews.
          Save time, reduce bias, and hire the best talent faster.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Start Free Trial
            </Button>
          </Link>
          <Link to="/demo">
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-neutral-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-secondary mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-center text-neutral-600 mb-12">
            Everything you need to revolutionize your hiring process
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-secondary mb-2">{feature.title}</h3>
                <p className="text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-secondary mb-12">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-700 mb-6 leading-relaxed">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-secondary">{testimonial.name}</p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-600 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            Join hundreds of companies already using AI to hire better talent
          </p>
          <Link to="/register">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary-600 hover:bg-neutral-50"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-neutral-900 text-neutral-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center">
            <p>&copy; 2024 AI Interview Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
