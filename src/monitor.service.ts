import { Injectable, HttpService, Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

/*
The monitoring service checks the cpu utilization load of the service b periodically
with a certain frequency.
*/
@Injectable()
export class MonitorService {
  //determines periodical check interval
  monitorFrequency = 5000;
  //max. threshold of received cpu utilization value
  cpuIssueThreshold = 50;
  cpuEndpoints = ['http://localhost:3001/cpu'];

  constructor(
    private httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    setInterval(async () => {
      this.getCpuLoads();
    }, this.monitorFrequency);
  }

  /*
  Get request to service b in order to fetch the cpu utilization load of the microservice.
  Thereupon a message is logged once the fetched cpu utilization load exceeds the threshold.
  */
  async getCpuLoads() {
    this.cpuEndpoints.map(async url => {
      try {
        const res = await this.httpService.get(url).toPromise();
        const cpuLoad = res.data;
        if (cpuLoad > this.cpuIssueThreshold) {
          this.logger.warn(`Cirtical CPU Load: ${cpuLoad} at ${url}`);
        }
        return res.data;
      } catch (e) {
        if (e.code === "ECONNREFUSED") {
          console.log(`Request at ${url} failed`);
        }
      }
    });
  }
}
