import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Shield, BarChart3, Bell, Users, MapPin } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Droplets className="h-16 w-16 text-primary mr-4" />
            <h1 className="text-5xl font-bold text-foreground">HydroNexus</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Smart Community Water Monitoring System - Protecting public health through 
            AI-powered water quality assessment and disease risk prediction
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link to="/auth">Access Dashboard</Link>
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Health Risk Prediction</CardTitle>
              <CardDescription>
                AI-powered analysis predicts disease risks based on water quality data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced machine learning algorithms analyze multiple water parameters 
                to predict potential health risks in your community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>
                Continuous tracking of water quality parameters across multiple sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor pH levels, turbidity, temperature, and bacterial contamination 
                in real-time from various water sources in your community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Smart Alerts</CardTitle>
              <CardDescription>
                Automated notifications when water quality exceeds safe thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Receive instant alerts via SMS and app notifications when water 
                quality parameters indicate potential health risks.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Community Health</CardTitle>
              <CardDescription>
                Protect entire communities with comprehensive health monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Designed for healthcare workers and community leaders to monitor 
                and protect public health at scale.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Multi-Source Tracking</CardTitle>
              <CardDescription>
                Monitor multiple water sources across different locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track water quality from wells, boreholes, and other sources 
                with location-based monitoring and reporting.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Data Analytics</CardTitle>
              <CardDescription>
                Comprehensive reports and trend analysis for better decision making
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Generate detailed reports and visualize trends to make informed 
                decisions about water safety and community health.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Protect Your Community?</CardTitle>
              <CardDescription>
                Join healthcare workers and community leaders already using AquaGuard 
                to monitor water quality and prevent waterborne diseases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full md:w-auto">
                <Link to="/auth">Get Started Today</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
