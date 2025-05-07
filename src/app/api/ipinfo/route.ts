
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Prefer request.ip (available on Vercel), fallback to x-forwarded-for
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim();

  if (!ip) {
    return NextResponse.json({ error: 'Could not determine client IP address.' }, { status: 400 });
  }
  
  // For local development, 'ip' might be '127.0.0.1' or a private IP.
  // ip-api.com will return an error or data for '127.0.0.1' itself.
  // For a deployed app, 'ip' should be the client's public IP.
  const apiUrl = `http://ip-api.com/json/${ip}?fields=status,message,country,city,isp,org,query`;

  try {
    const geoResponse = await fetch(apiUrl);
    
    // ip-api.com usually returns 200 OK even for errors in query (e.g. private IP),
    // so we must check the 'status' field in the JSON response.
    const geoData = await geoResponse.json();

    if (!geoResponse.ok && geoData.status !== 'success') { 
      // This handles network errors or unexpected non-JSON responses if ip-api is down
      throw new Error(`Failed to fetch IP info: ${geoResponse.statusText} - ${geoData.message || ''}`);
    }
    
    if (geoData.status === 'fail') {
      // This can happen for private IPs, reserved ranges.
      // We'll return the queried IP with N/A for other fields.
      return NextResponse.json({
        ip: ip, 
        isp: `N/A (Reason: ${geoData.message || 'Private IP range or API error'})`,
        org: `N/A`,
        city: 'N/A',
        country: 'N/A',
      });
    }

    return NextResponse.json({
      ip: geoData.query || ip, // geoData.query is the IP that was looked up
      isp: geoData.isp || 'N/A',
      org: geoData.org || 'N/A', // Often contains ISP name or owning organization
      city: geoData.city || 'N/A',
      country: geoData.country || 'N/A',
    });
  } catch (error: any) {
    console.error('Error in /api/ipinfo:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve server information' }, { status: 500 });
  }
}
